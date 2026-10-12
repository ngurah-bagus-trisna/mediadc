import { recommended } from '@nextcloud/eslint-config'

export default [
	...recommended,
	{
		ignores: ['js/**', 'vendor/**', 'node_modules/**'],
	},
]
