import pactum from "pactum";

export const setupIntTest = () => {
  const DEFAULT_TEST_HOST = 'http://localhost:3031';
  const testHost = Deno.env.get('TEST_HOST') ?? DEFAULT_TEST_HOST;

  if (Deno.env.get('TEST_HOST') === undefined) {
    Deno.env.set('TEST_HOST', testHost);
  }

  pactum.request.setBaseUrl(testHost);
}