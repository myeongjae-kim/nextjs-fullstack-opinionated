import { assertEquals } from "@std/assert";

Deno.test("simple test", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});