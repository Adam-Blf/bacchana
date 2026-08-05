import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  // .claude/worktrees/** heberge des checkouts paralleles d'autres agents (chacun avec son
  // propre tsconfig.json) - sans cette exclusion, typescript-eslint detecte plusieurs
  // tsconfigRootDir candidats et casse le lint local (n'affecte pas la CI : .claude/ est
  // gitignore, donc absent d'un checkout frais).
  { ignores: ['dist', 'dev-dist', 'vite.config.js', 'vite.config.d.ts', '.claude'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  }
)
