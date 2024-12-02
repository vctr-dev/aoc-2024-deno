import fs from "node:fs/promises";

export default async function (inputPath: string) {
  const input = await fs.readFile(inputPath, { encoding: "utf-8" });
  const parsed = parseInput(input);
  // Part 1
  // const r = parsed.filter((v) => check(v));
  // console.log(r.length);

  // Part 2
  const r = parsed.filter((v) => checkWithRemove(v));
  console.log(r.length);
}

function parseInput(input: string) {
  return input
    .trim()
    .split("\n")
    .map((v) => v.split(" ").map((v) => ~~v));
}

function checker(input: number[], check: (a: number, b: number) => boolean) {
  for (let i = 1; i < input.length; i++) {
    if (!check(input[i - 1], input[i])) {
      return false;
    }
  }
  return true;
}

function increase(input: number[]) {
  return checker(input, (a, b) => a > b);
}
function difference(input: number[]) {
  return checker(input, (a, b) => {
    const diff = Math.abs(a - b);
    return diff >= 1 && diff <= 3;
  });
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
  return difference(input) && (increase(input) || increase(input.reverse()));
}
