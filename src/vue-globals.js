/**
 * @license AGPL-3.0-or-later
 */

import { translate, translatePlural } from '@nextcloud/l10n'

/**
 * Vue 3 replacement for the Vue 2 `Vue.prototype.*` assignments: exposes the
 * Nextcloud l10n helpers (and the legacy OC/OCA globals) to every component
 * as `this.t()`, `this.n()`, `this.OC` and `this.OCA`, and to templates as
 * `t()`, `n()`, `OC` and `OCA`.
 *
 * @param {import('vue').App} app The Vue application instance
 * @return {import('vue').App} The same instance, for chaining
 */
export function installGlobals(app) {
	app.config.globalProperties.t = translate
	app.config.globalProperties.n = translatePlural
	app.config.globalProperties.OC = window.OC
	app.config.globalProperties.OCA = window.OCA
	return app
}
