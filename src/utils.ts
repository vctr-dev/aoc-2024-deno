export function makeMap<T>(input: T[]): Map<T, number> {
  return input.reduce((a, v) => a.set(v, (a.get(v) ?? 0) + 1), new Map());
}

export function sum(arr: number[]) {
  return arr.reduce((a, v) => a + v, 0);
}
