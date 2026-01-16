import { parseArgs } from "@std/cli/parse-args";
import serverApp from "./serverApp.ts";

const flags = parseArgs(Deno.args, {
  string: ["port"],
});

Deno.serve({port: Number(flags.port) || 8080}, serverApp.fetch)
