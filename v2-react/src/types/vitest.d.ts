declare module 'vitest' {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void): void;
  export const expect: {
    (actual: any): {
      toBe(expected: any): void;
      toEqual(expected: any): void;
    };
  };
}