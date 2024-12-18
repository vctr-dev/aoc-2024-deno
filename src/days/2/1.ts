import fs from "node:fs/promises";
import { checkPrevious } from "../../utils.ts";

export default async function (inputPath: string) {
  const input = await fs.readFile(inputPath, { encoding: "utf-8" });
  const parsed = parseInput(input);
  // Part 1
  const r = parsed.filter((v) => check(v));
  console.log(`Part 1: ${r.length}`);

  // Part 2
  const s = parsed.filter((v) => checkWithRemove(v));
  console.log(`Part 1: ${s.length}`);
}

function parseInput(input: string) {
  return input
    .trim()
    .split("\n")
    .map((v) => v.split(" ").map((v) => ~~v));
}

function checkWithRemove(input: number[]) {
  // remove one at a time to see if it meets criteria
  const trials = input.length;
  for (let i = 0; i < trials; i++) {
    const arr = [...input];
    arr.splice(i, 1);
    if (check(arr)) return true;
  }
}

function check(input: number[]) {
  return isDist(input) && (isIncrease(input) || isIncrease(input.reverse()));
}

function isIncrease(input: number[]) {
  return checkPrevious(input, (prev, next) => prev > next);
}
function isDist(input: number[]) {
  return checkPrevious(input, (prev, next) => {
    const diff = Math.abs(prev - next);
    return diff >= 1 && diff <= 3;
  });
}
