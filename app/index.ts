import serverApp from '@/app/serverApp.js';
import { serve } from '@hono/node-server';
import minimist from 'minimist';

const { port } = minimist<{ port?: number }>(process.argv.slice(2));

serve({ fetch: serverApp.fetch, port: port ?? 8080 }, (info) => {
  console.info(`Server is running on ${info.address}:${info.port}`)
})