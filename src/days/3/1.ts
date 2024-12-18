import { sum } from "../../utils.ts";
export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);
  // Part 1
  // const regex = /mul\((\d{1,3}),(\d{1,3})\)/mg;
  // const res = [...parsed.matchAll(regex)].map((v) => ({
  // a: ~~v[1],
  // b: ~~v[2],
  // match: v[0],
  // }));
  // console.log(sum(res.map(({ a, b }) => a * b)));
  // Part 2
  const regex = /do\(\)|don't\(\)|mul\((\d{1,3}),(\d{1,3})\)/mg;
  const res = [...parsed.matchAll(regex)].map(([match, a, b]) => ({
    match,
    a,
    b,
  }));

  console.log(res);
  let mulEnabled = true;
  let sum = 0;
  res.forEach(({ match, a, b }) => {
    if (match === "do()") {
      mulEnabled = true;
      return;
    }
    if (match === "don't()") {
      mulEnabled = false;
      return;
    }
    if (mulEnabled) {
      sum += ~~a * ~~b;
    }
  });
  console.log(sum);
}

function parseInput(input: string) {
  return input
    .trim();
}
