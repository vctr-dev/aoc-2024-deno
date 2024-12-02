export function makeMap<T>(input: T[]): Map<T, number> {
  return input.reduce((a, v) => a.set(v, (a.get(v) ?? 0) + 1), new Map());
}

export function sum(arr: number[]) {
  return arr.reduce((a, v) => a + v, 0);
}

export function checkPrevious(
  input: number[],
  check: (prev: number, next: number) => boolean
) {
  for (let i = 1; i < input.length; i++) {
    if (!check(input[i - 1], input[i])) {
      return false;
    }
  }
  return true;
}
