import tselintPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from 'eslint-plugin-import';
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from 'typescript-eslint';

const eslintConfig = defineConfig([
  globalIgnores([
    "**/*.mjs",
    "dist/**",
  ]),
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint/eslint-plugin': tselintPlugin,
      'import': importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^ignore',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/func-call-spacing': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          ts: 'never'
        }
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/../*', './*', '../*'],
              message: '"@/..." 형태의 절대경로(alias)를 사용하세요. 상대경로는 마지막이 .js로 끝나는지 자동으로 검사할 수 없습니다.'
            }
          ]
        }
      ],
      'quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ]
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.js']
        }
      }
    }
  }
]);

export default eslintConfig;
