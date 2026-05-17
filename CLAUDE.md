# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

MediaDC (Media Duplicate Collector) is a Nextcloud app that finds duplicate/similar photos and videos. It has a hybrid architecture: PHP backend (Nextcloud app framework), Python worker (perceptual hashing via `nc-py-api`), and a Vue 2 SPA frontend.

The app is **archived upstream**; this fork's goal is to add support for latest Nextcloud versions.

Central constraint: **`cloud_py_api` must be installed and enabled** on the Nextcloud instance for MediaDC to function, since the Python worker runs through it.

## Development environment

Development happens inside the LXC container **`nb-ncdev`**. Access it with `lxc exec nb-ncdev bash` or `ssh nb-ncdev`. The Nextcloud installation and `cloud_py_api` app are already set up there. Python, npm, and composer dependencies for MediaDC should be installed inside that container.

## Build & test commands

```bash
# JavaScript / Vue frontend
make build-js          # dev build (npm run dev via webpack)
make build-js-production  # production build (npm run build)
make watch-js          # watch mode
make lint              # ESLint on src/
make lint-fix          # ESLint auto-fix
make stylelint         # CSS/Vue style lint
make stylelint-fix     # CSS/Vue style fix

# PHP backend
composer lint          # PHP syntax check
composer cs:check      # PHP CS Fixer (dry-run)
composer cs:fix        # PHP CS Fixer
composer psalm         # Static analysis
composer test:unit     # PHP unit tests
composer test:integration  # PHP integration tests

# Python worker (no formal test suite — manual testing)
# Python requirements: numpy, scipy, pywavelets, pillow==10.3.0, hexhamming, nc-py-api==0.0.11, pi-heif>=0.9.0
```

## Architecture

```
User (Vue SPA) → PHP API controllers → PHP Service layer → PythonService (cloud_py_api)
                                                              ↓
                                                    Python worker process
                                                    (main.py → task.py →
                                                     images.py / videos.py)
                                                              ↓
                                                    SQL (via nc-py-api DB connection)
```

### Three-layer stack

| Layer | Tech | Location | Role |
|-------|------|----------|------|
| Frontend | Vue 2 + Vuex + Vue Router | `src/` | SPA with task management, detail views, settings |
| PHP backend | Nextcloud App Framework | `lib/` | API controllers (REST), DB mappers, service layer, migrations |
| Python worker | `nc-py-api` runtime | `python/` + `main.py` | Image/video perceptual hashing, duplicate grouping |

### PHP backend (`lib/`)

- **`AppInfo/Application.php`** — App entry point, registers dashboard widget, notifier, files plugin listener
- **`Controller/`** — `PageController` (renders main template), `CollectorController` (REST API for tasks), `SettingsController` (admin/user settings API)
- **`Service/`** — Business logic: `CollectorService` (task CRUD, duplicate resolution, file deletion), `PhotosService`/`VideosService` (resolved files tracking), `SettingsService`
- **`Db/`** — Entity + Mapper classes for 5 tables: `mediadc_tasks`, `mediadc_tasks_details`, `mediadc_photos`, `mediadc_videos`, `mediadc_settings`
- **`Migration/`** — DB schema migrations (3 versions), plus install/uninstall/update repair steps

API routes are defined in `appinfo/routes.php`. The frontend communicates via these REST endpoints (prefixed with `/api/v1/`).

### Python worker (`python/` + `main.py`)

Entry point: `main.py` — CLI with `-t <task_id>` argument. Called by PHP's `PythonService->run()`.

**Core flow** (`python/task.py`):
1. Fetch task from DB, check if already running (`analyze_and_lock`)
2. `init_task_settings()` — build config dict from task row + collector settings
3. Based on task type, call `process_image_task()` and/or `process_video_task()`
4. Recursively walk directories, compute hashes, group by hamming distance
5. Save groups to `mediadc_tasks_details` table

**Image hashing** (`python/images.py`):
- Algorithms: `phash`, `dhash`, `whash`, `average` (from `python/imagehash.py` — vendored from JohannesBuchner/imagehash v4.2.1)
- Configurable hash size (default 16) and similarity threshold
- Results cached per-fileid+mtime in `mediadc_photos` table for reuse across tasks
- HEIF/HEIC support via `pi-heif`
- Groups stored in-memory as `{group_num: [fileid, ...]}`, solo groups discarded before saving

**Video hashing** (`python/videos.py`):
- Extracts 4 frames at calculated timestamps via ffmpeg
- Skips frames that are too dark or too bright
- Hashes each frame (same image algorithms), concatenates 4 hashes into one
- `hexhamming` library used for fast hamming distance on hex string hashes
- Direct access path preferred; falls back to streaming data for non-local files
- Results cached in `mediadc_videos` table

**DB access** (`python/db_requests.py`, `python/db_tables.py`):
- All SQL queries run through `nc-py-api`'s `execute_commit`/`execute_fetchall`
- Table names come from `*PREFIX*mediadc_*` pattern

### Frontend (`src/`)

Vue 2 SPA with Vue Router (3 routes: `/`, `/tasks/:taskId`, `/resolved`) and Vuex store (modules: `tasks`, `details`, `resolved`, `settings`). Uses `@nextcloud/vue` component library. Built with webpack, output goes to `js/`.

Entry points: `src/main.js` (main app), `src/main-admin-settings.js` (admin settings page), `src/main-dashboard.js` (dashboard widget), `src/filesplugin.js` (Files app integration).

### Key database tables

- **`mediadc_tasks`** — One row per scan task. Columns: `id`, `owner`, `type` (manual/auto/queued), `target_directory_ids` (JSON), `exclude_list` (JSON), `collector_settings` (JSON), `files_scanned`, `files_total`, `py_pid`, `errors`, timestamps
- **`mediadc_tasks_details`** — Duplicate groups: `task_id`, `group_id`, `fileid` (one row per file in a group)
- **`mediadc_photos`** / **`mediadc_videos`** — Hash cache: `fileid`, `hash`, `mtime`, `skipped` (+ `duration`/`timestamps` for videos)
- **`mediadc_settings`** — App configuration key-value store

## Version compatibility

Current `appinfo/info.xml` declares **Nextcloud min-version="30" max-version="31"**. The primary task for this project is bumping max-version to support the latest Nextcloud releases and fixing any API breaks.

Python dependencies are tightly pinned — `nc-py-api==0.0.11` and `pillow==10.3.0`. Upgrading `nc-py-api` may be needed for compatibility with newer Nextcloud/`cloud_py_api` versions.

## Key external dependencies

- **`cloud_py_api`** Nextcloud app — Provides the `PythonService` PHP class and the `nc-py-api` Python package that bridges PHP ↔ Python
- **ffmpeg/ffprobe** — Required on the server for video processing
- **`pi-heif`** — HEIF/HEIC image support (hard dependency)
- **`hexhamming`** — Accelerated hamming distance for hex strings (optional, fallback available)
