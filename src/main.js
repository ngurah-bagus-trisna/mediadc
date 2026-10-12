/**
 * @copyright Copyright (c) 2021-2022 Andrey Borysenko <andrey18106x@gmail.com>
 *
 * @copyright Copyright (c) 2021-2022 Alexander Piskun <bigcat88@icloud.com>
 *
 * @author 2021-2022 Andrey Borysenko <andrey18106x@gmail.com>
 *
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { generateFilePath } from '@nextcloud/router'
import { getRequestToken } from '@nextcloud/auth'
import '@nextcloud/dialogs/style.css'
import { createApp } from 'vue'

import MediaDC from './MediaDC.vue'
import router from './router/index.js'
import store from './store/index.js'
import { installGlobals } from './vue-globals.js'

// eslint-disable-next-line
__webpack_nonce__ = btoa(getRequestToken())

// eslint-disable-next-line
__webpack_public_path__ = generateFilePath('mediadc', '', 'js/')

window.addEventListener('DOMContentLoaded', () => {
	window.OCA = window.OCA || {}
	window.OCA.Files = window.OCA.Files || {}

	if (window.OC?.Files?.getClient) {
		window.OCA.Files.App = window.OCA.Files.App || {}
		window.OCA.Files.App.fileList = window.OCA.Files.App.fileList || {}
		window.OCA.Files.App.fileList.filesClient = window.OC.Files.getClient()
	}
})

const app = createApp(MediaDC)
installGlobals(app)
app.use(router)
app.use(store)

export default app.mount('#mediadc-app')
