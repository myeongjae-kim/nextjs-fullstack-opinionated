type DetectOptions = {
  durationMs: number;
  port: string;
};

function parseArgs(args: string[]): DetectOptions {
  let durationMs = 5000;
  let port = "0";

  for (const arg of args) {
    if (arg.startsWith("--duration-ms=")) {
      durationMs = Number(arg.split("=", 2)[1] ?? "");
      continue;
    }
    if (arg.startsWith("--port=")) {
      port = arg.split("=", 2)[1] ?? "0";
      continue;
    }
  }

  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error("--duration-ms must be a positive number");
  }

  return { durationMs, port };
}

async function readStreamToText(stream: ReadableStream<Uint8Array> | null): Promise<string> {
  if (!stream) return "";

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(merged);
}

function extractDownloadUrls(output: string): string[] {
  // Deno output patterns:
  // - "Download https://..."
  // - "Downloading https://..."
  const urls = new Set<string>();
  const regex = /\bDownload(?:ing)?\s+(https?:\/\/\S+)/g;
  for (const match of output.matchAll(regex)) {
    const url = match[1];
    if (url) urls.add(url.replace(/[\s"'`]+$/g, ""));
  }
  return [...urls].sort();
}

async function runDenoCache(
  denoDir: string,
  env: Record<string, string>,
  port: string,
  durationMs: number,
): Promise<void> {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["cache", "app/index.ts"],
    env: {
      DENO_DIR: denoDir,
      NO_COLOR: "1",
    },
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });

  const output = await cmd.output();
  if (!output.success) {
    const stderr = new TextDecoder().decode(output.stderr);
    throw new Error(`deno cache failed:\n${stderr}`);
  }

  // already cached dependencies
  await Promise.all([
    "import * as bcrypt from '@felix/bcrypt'; await bcrypt.hash('warmup');",
  ].map(async (code) => {
    const drizzleCmd = new Deno.Command(Deno.execPath(), {
      args: ["eval", "-q", code],
      env: {
        DENO_DIR: denoDir,
        NO_COLOR: "1",
      },
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    });

    const drizzleOutput = await drizzleCmd.output();
    if (!drizzleOutput.success) {
      const stderr = new TextDecoder().decode(drizzleOutput.stderr);
      throw new Error(`warmup failed: ${code}\n${stderr}`);
    }
  }));

  const runCmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "app/index.ts", `--port=${port}`],
    env,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });

  const child = runCmd.spawn();
  const timer = setTimeout(() => {
    try {
      child.kill("SIGTERM");
    } catch {
      // ignore
    }
  }, durationMs);

  try {
    await child.status;
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(Deno.args);

  const denoDir = await Deno.makeTempDir({ prefix: "deno-runtime-downloads-" });

  // Provide minimal env vars so the app can boot far enough to reveal downloads.
  const env: Record<string, string> = {
    DENO_DIR: denoDir,
    NO_COLOR: "1",
    PROFILE: "local",
    DB_PRIMARY_URL: "mysql://mysql:mysql@localhost:3306/public",
    DB_REPLICA_URL: "mysql://mysql:mysql@localhost:3306/public",
    DB_PRIMARY_URL_LOCAL: "mysql://mysql:mysql@localhost:3306/public",
    USE_MOCK_ADAPTER: "true",
    AUTH_SECRET: "fake-value",
  };

  // First, cache dependencies into an empty DENO_DIR. Then detect what still downloads at runtime.
  await runDenoCache(denoDir, env, options.port, options.durationMs);

  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", "app/index.ts", `--port=${options.port}`],
    env,
    stdin: "null",
    stdout: "piped",
    stderr: "piped",
  });

  const child = cmd.spawn();

  const timer = setTimeout(() => {
    try {
      child.kill("SIGTERM");
    } catch {
      // ignore
    }
  }, options.durationMs);

  try {
    const [stdout, stderr] = await Promise.all([
      readStreamToText(child.stdout),
      readStreamToText(child.stderr),
    ]);

    // Wait for process to exit (likely due to SIGTERM).
    await child.status;

    const combined = `${stdout}\n${stderr}`;
    const urls = extractDownloadUrls(combined);

    console.log(`DENO_DIR: ${denoDir}`);
    console.log(`durationMs: ${options.durationMs}`);
    console.log(`port: ${options.port}`);
    console.log("");
    console.log(`Detected ${urls.length} download(s):`);
    for (const url of urls) {
      console.log(`- ${url}`);
    }
  } finally {
    clearTimeout(timer);
    try {
      await Deno.remove(denoDir, { recursive: true });
    } catch {
      // ignore
    }
  }
}

if (import.meta.main) {
  await main();
}

