import type { StorybookConfig } from '@storybook/react-vite';

/**
 * storybook에 가장 중요한 설정 파일
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  // 편의 기능을 제공하는 애드온들
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  // storybook 구동 시 필요한 framework 설정
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};
export default config;
