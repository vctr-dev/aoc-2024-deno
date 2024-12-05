import { sum } from "../../utils.ts";

export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const [rules, updates] = parseInput(input);
  const a = getValidUpdates(rules, updates);
  const b = a.map((v) => v[Math.floor(v.length / 2)]);
  console.log("part 1: " + sum(b));

  const c = getInvalidUpdates(rules, updates);
  const d = c.map((v) => correctUpdate(rules, v));
  const e = d.map((v) => v[Math.floor(v.length / 2)]);
  console.log("part 2: " + sum(e));
}
function correctUpdate(rules: number[][], v: number[]): number[] {
  const res = [...v];

  let touched = true;
  while (touched) {
    touched = false;
    rules.forEach((r) => {
      if (!(new Set(res)).isSupersetOf(new Set(r))) {
        return;
      }
      if (isValid(r, res)) {
        return;
      }
      touched = true;
      const a = r.map((rv) => res.findIndex((value) => value == rv));

      a.forEach((foundIndex, i) => res[foundIndex] = r.toReversed()[i]);
    });
  }

  return res;
}

function getInvalidUpdates(rules: number[][], updates: number[][]) {
  return updates.filter((v) => rules.some((rule) => !isValid(rule, v)));
}
function getValidUpdates(rules: number[][], updates: number[][]) {
  return updates.filter((v) => rules.every((rule) => isValid(rule, v)));
}

function isValid(r: number[], v: number[]): boolean {
  if (!(new Set(v)).isSupersetOf(new Set(r))) {
    return true;
  }
  let lastFound = -1;
  return r.every((rv) => {
    const vi = v.findIndex((vv) => vv == rv);
    if (vi >= lastFound) {
      lastFound = vi;
      return true;
    }
    return false;
  });
}

function parseInput(input: string) {
  const [part1, part2] = input
    .trim().split("\n\n");
  const a = part1.split("\n").map((v) => v.split("|").map((v) => ~~v));
  const b = part2.split("\n").map((v) => v.split(",").map((v) => ~~v));

  return [a, b];
}
