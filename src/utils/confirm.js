/**
 * @license AGPL-3.0-or-later
 */

import { getDialogBuilder } from '@nextcloud/dialogs'
import { translate as t } from '@nextcloud/l10n'

/**
 * Replacement for the legacy `OC.dialogs.confirm()`, which is deprecated in
 * recent Nextcloud releases. Resolves to `true` when the user confirmed.
 * If the dialog is dismissed (Esc / close button) the promise stays pending,
 * so callers only ever act on an explicit confirmation.
 *
 * @param {string} title Dialog title
 * @param {string} text Dialog text
 * @return {Promise<boolean>}
 */
export function confirmDialog(title, text) {
	return new Promise((resolve) => {
		getDialogBuilder(title)
			.setText(text)
			.setButtons([
				{
					label: t('mediadc', 'No'),
					variant: 'secondary',
					callback: () => resolve(false),
				},
				{
					label: t('mediadc', 'Yes'),
					variant: 'primary',
					callback: () => resolve(true),
				},
			])
			.build()
			.show()
	})
}
