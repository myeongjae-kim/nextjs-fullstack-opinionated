import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function generateAuthSecret(): string {
  console.info('Step 1: Generating AUTH_SECRET...');
  return crypto.randomBytes(32).toString('hex');
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.info('Step 2: Writing environment variables to .env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.writeFile(path.join(process.cwd(), '.env'), envContent);
  console.info('.env file created with the necessary variables.');
}

async function main() {
  const AUTH_SECRET = generateAuthSecret();

  await writeEnvFile({
    NEXT_PUBLIC_PROFILE: 'local',
    DB_PRIMARY_URL: 'mysql://root:root@localhost:3306/public',
    DB_REPLICA_URL: 'mysql://root:root@localhost:3306/public',
    DB_PRIMARY_URL_LOCAL: 'mysql://root:root@localhost:3306/public',
    USE_MOCK_ADAPTER: 'false',
    AUTH_SECRET,
  });

  console.info('🎉 Setup completed successfully!');
}

main().catch(console.error);
