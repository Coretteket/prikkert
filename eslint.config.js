import perfectionist from 'eslint-plugin-perfectionist'
import { includeIgnoreFile } from '@eslint/compat'
import prettier from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import unicorn from 'eslint-plugin-unicorn'
import svelte from 'eslint-plugin-svelte'
import { fileURLToPath } from 'node:url'
import ts from 'typescript-eslint'
import globals from 'globals'
import js from '@eslint/js'

import svelteConfig from './svelte.config.js'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	unicorn.configs.recommended,
	{ rules: { 'unicorn/prevent-abbreviations': 'off', 'unicorn/prefer-spread': 'off' } },
	prettier,
	...svelte.configs.prettier,
	{
		plugins: { perfectionist },
		rules: {
			'perfectionist/sort-imports': [
				'error',
				{
					type: 'line-length',
					order: 'desc',
					customGroups: [{ groupName: 'svelte', elementNamePattern: String.raw`^\$app` }],
					groups: [
						'side-effect',
						'type-import',
						['value-builtin', 'value-external'],
						'svelte',
						'type-internal',
						'value-internal',
						['type-parent', 'type-sibling', 'type-index'],
						['value-parent', 'value-sibling', 'value-index'],
						'ts-equals-import',
						'unknown',
					],
				},
			],
		},
	},
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			'svelte/require-each-key': 'off',
			'no-restricted-globals': [
				'error',
				{
					name: 'Temporal',
					message:
						'Do not use global Temporal. Import it from "@/shared/temporal" to ensure the polyfill is loaded.',
				},
			],
		},
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
)
