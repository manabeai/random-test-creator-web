import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base =
  process.env.GITHUB_ACTIONS === 'true' && repositoryName
    ? `/${repositoryName}/`
    : '/';

export default defineConfig({
  plugins: [preact()],
  root: '.',
  base,
  build: {
    outDir: 'dist',
  },
});
