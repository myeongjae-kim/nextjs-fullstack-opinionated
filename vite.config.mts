import devServer from '@hono/vite-dev-server';
import dotenv from 'dotenv';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

dotenv.config();

export default defineConfig({
  plugins: [tsconfigPaths(), devServer({
    entry: 'app/serverApp.ts',
  }),],
})