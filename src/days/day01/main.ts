import fs from "node:fs/promises";
import { makeMap, sum } from "../../utils.ts";

export default async function (inputPath: string) {
  const input = await fs.readFile(inputPath, { encoding: "utf-8" });
  const [x, y] = parseInput(input);

  // Part 1
  const p = x.map((v, i) => [v, y[i]]);
  const z = sum(p.map(([a, b]) => Math.abs(a - b)));
  console.log(`Part 1: ${z}`);

  // Part 2
  const map = makeMap(y);
  const r = sum(x.map((v) => v * (map.get(v) ?? 0)));
  console.log(`Part 2: ${r}`);
}

function parseInput(input: string) {
  const a = input
    .trim()
    .split("\n")
    .map((v) => v.split("   ").map((v) => ~~v));
  const b = a.map((v) => v[0]).sort();
  const c = a.map((v) => v[1]).sort();
  const d = [b, c];
  return d;
}
