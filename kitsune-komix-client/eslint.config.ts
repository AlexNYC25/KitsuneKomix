import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import importX from 'eslint-plugin-import-x'
import pluginVue from 'eslint-plugin-vue'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'src/openapi/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
  skipFormatting,
  {
    name: 'app/import-x',
    plugins: { 'import-x': importX },
    rules: {
      'import-x/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        },
      ],
      'import-x/no-duplicates': 'warn',
      'import-x/newline-after-import': 'warn',
      'import-x/first': 'warn',
    },
  },
  {
    name: 'app/vue-script-setup',
    rules: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/define-macros-order': ['warn', { order: ['defineProps', 'defineEmits', 'defineExpose'] }],
      'vue/no-setup-props-reactivity-loss': 'warn',
    },
  },
  {
    name: 'app/alias-imports',
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/**/*.ts', './**/*.ts', '../**/*.ts'], message: 'Do not use .ts extension in imports.' },
            { group: ['../*', '../**'], message: 'Use @/ alias instead of relative parent imports.' },
          ],
        },
      ],
    },
  },
)
