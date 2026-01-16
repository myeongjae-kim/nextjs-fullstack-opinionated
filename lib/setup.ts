function generateAuthSecret(): string {
  console.info('Step 1: Generating AUTH_SECRET...');
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function writeEnvFile(envVars: Record<string, string>): Promise<void> {
  console.info('Step 2: Writing environment variables to .env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await Deno.writeTextFile('.env', envContent);
  console.info('.env file created with the necessary variables.');
}

async function main(): Promise<void> {
  const AUTH_SECRET = generateAuthSecret();

  await writeEnvFile({
    PROFILE: 'local',
    DB_PRIMARY_URL: 'mysql://root:root@localhost:3306/public',
    DB_REPLICA_URL: 'mysql://root:root@localhost:3306/public',
    DB_PRIMARY_URL_LOCAL: 'mysql://root:root@localhost:3306/public',
    USE_MOCK_ADAPTER: 'false',
    AUTH_SECRET,
  });

  console.info('🎉 Setup completed successfully!');
}

if (import.meta.main) {
  main().catch(console.error);
}
