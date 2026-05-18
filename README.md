# Nextcloud MediaDC

> Community-maintained fork — updated to support Nextcloud 30–34.

**📸📹 Collect photo and video duplicates to save your cloud storage space**

---

The [original MediaDC](https://github.com/cloud-py-api/mediadc) by Andrey Borysenko and Alexander Piskun has been archived. This fork continues maintenance to keep MediaDC working on the latest Nextcloud versions with **zero manual setup** — just enable the app and it works.

## Why is this so awesome?

* **♻ Detects similar and duplicate photos/videos with different resolutions, sizes and formats**
* **💡 Easily saves your cloud storage space and time for sorting**
* **⚙ Flexible configuration** — hashing algorithms, similarity threshold, hash size
* **🚀 Zero-setup** — Python environment auto-configured during app enable, no manual steps
* **🗄️ All databases supported** — SQLite, MySQL/MariaDB, PostgreSQL

## 🚀 Installation

### Fresh install (Nextcloud 30–34)

1. Download `mediadc.tar.gz` from the [latest release](https://github.com/ngurah-bagus-trisna/mediadc/releases/latest)
2. Extract to your Nextcloud `apps/` directory:
   ```bash
   tar xzf mediadc.tar.gz -C /path/to/nextcloud/apps/
   ```
3. Enable the app:
   ```bash
   sudo -u www-data php /path/to/nextcloud/occ app:enable mediadc
   ```
4. **Done!** The Python environment (venv + packages) will be automatically set up during first enable. This may take 1–3 minutes.

**Requirements:**
- Nextcloud 30, 31, 32, 33, or 34
- PHP 8.1 or later
- Python 3.9 or later (with `venv` support — `apt install python3-venv` on Debian/Ubuntu if missing)
- `ffmpeg` (optional — only needed for video duplicate detection)

### Upgrade from 0.4.x

Disable and re-enable the app to trigger the auto-setup:
```bash
sudo -u www-data php occ app:disable mediadc
sudo -u www-data php occ app:enable mediadc
```

## What changed from the original

| Original (0.4.0) | This fork (0.5.0+) |
|---|---|
| Requires `cloud_py_api` app installed | Self-contained — cloud_py_api vendored |
| Manual Python venv + pip install | Auto-setup during app enable |
| PostgreSQL & MySQL only | SQLite also supported |
| Nextcloud 30–31 only | Nextcloud 30–34 |
| Tasks stuck pending from UI | Fixed — async worker launches correctly |
| Binary download mode | Source Python mode (simpler, no GitHub download) |

## Credits

Original project by **[Andrey Borysenko](https://github.com/andrey18106)** and **[Alexander Piskun](https://github.com/bigcat88)**.

This fork maintained by **[Ngurah Bagus Trisna](https://github.com/ngurah-bagus-trisna)**.
