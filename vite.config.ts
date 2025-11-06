import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { defineConfig as defineTestConfig, mergeConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default mergeConfig(
  defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    test: {
      projects: (() => {
        const projects = [];
        // CI 환경에서는 Storybook 테스트 제외 (Chromatic에서 실행)
        if (!process.env.CI) {
          projects.push({
            extends: true as const,
            plugins: [
              // The plugin will run tests for the stories defined in your Storybook config
              // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
              storybookTest({
                configDir: path.join(dirname, '.storybook'),
              }),
            ],
            test: {
              name: 'storybook',
              browser: {
                enabled: true,
                headless: true,
                provider: 'playwright',
                instances: [
                  {
                    browser: 'chromium',
                  },
                ],
              },
              setupFiles: ['.storybook/vitest.setup.ts'],
            },
          });
        }
        projects.push({
          test: {
            name: 'unit',
            globals: true,
            environment: 'jsdom',
            setupFiles: './src/setupTests.ts',
            include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
            exclude: [
              '**/node_modules/**',
              '**/dist/**',
              '**/src/__tests__/e2e/**',
              '**/*.stories.*',
            ],
          },
        });
        return projects;
      })(),
    },
  }),
  defineTestConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      exclude: ['**/node_modules/**', '**/dist/**', '**/src/__tests__/e2e/**'],
      coverage: {
        reportsDirectory: './.coverage',
        reporter: ['lcov', 'json', 'json-summary'],
      },
    },
  })
);
