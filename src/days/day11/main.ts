import { sum } from "../../utils.ts";

export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);
  console.log(parsed);
  // either:
  // 0 => 1
  // even number of digits => left, right (removing leading 0s)
  // else replace with new stone => old * 2024
  // Order preserved
  let map = new Map<number, number>();
  parsed.forEach((v) => map.set(v, (map.get(v) ?? 0) + 1));
  for (let i = 0; i < 75; i++) {
    map = blink(map);
  }
  console.log(sum([...map.values()]));
}

function blink(map: Map<number, number>) {
  const newMap = new Map<number, number>();
  map.entries().forEach(([k, v]) => {
    if (k === 0) {
      newMap.set(1, (newMap.get(1) ?? 0) + v);
      return;
    }
    const str = k.toString();
    if (str.length % 2 === 0) {
      const left = parseInt(str.slice(0, str.length / 2));
      const right = parseInt(str.slice(str.length / 2));
      newMap.set(left, (newMap.get(left) ?? 0) + v);
      newMap.set(right, (newMap.get(right) ?? 0) + v);
      return;
    }
    const key = k * 2024;
    newMap.set(key, (newMap.get(key) ?? 0) + v);
  });
  return newMap;
}

function parseInput(input: string) {
  return input
    .trim().split(" ").map((v) => parseInt(v, 10));
}
