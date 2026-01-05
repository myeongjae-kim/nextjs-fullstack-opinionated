export const lazy = <T>(fn: () => T) => {
  let value: T | undefined;
  return () => value ?? (value = fn());
};