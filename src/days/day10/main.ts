import { sum } from "../../utils.ts";
export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);
  // Part 1
  const trialheads: Vector[] = [];
  parsed.forEach((r, y) =>
    r.forEach((v, x) => {
      if (v === 0) trialheads.push(new Vector(x, y));
    })
  );
  const res = trialheads.map((p) => numberRoutes(p, parsed));
  console.log("p1: ", sum(res.map((v) => v.size)));
  console.log("p2: ", sum(res.flatMap((v) => [...v.values()])));
}
function numberRoutes(p: Vector, map: number[][]) {
  const initVal = onMap(p, map)!;
  const stack: { val: number | undefined; point: Vector }[] = [{
    val: initVal,
    point: p,
  }];
  const reachableTrailEnd = new Map<string, number>();
  while (stack.length > 0) {
    const { val, point } = stack.pop()!;
    if (val === 9) {
      reachableTrailEnd.set(
        point.toString(),
        (reachableTrailEnd.get(point.toString()) ?? 0) + 1,
      );
      continue;
    }
    if (val === undefined) {
      continue;
    }
    const nextVal = val + 1;
    stack.push(
      ...point.getCord().map((point) => ({ point, val: onMap(point, map) }))
        .filter(
          (c) => c.val === nextVal,
        ),
    );
  }
  return reachableTrailEnd;
}

function onMap<T>(p: Vector, map: T[][]) {
  return map[p.y]?.[p.x];
}

class Vector {
  constructor(public x: number, public y: number) {
  }
  add(dir: Vector) {
    return new Vector(this.x + dir.x, this.y + dir.y);
  }
  getCord() {
    const cord = [
      new Vector(0, 1),
      new Vector(0, -1),
      new Vector(1, 0),
      new Vector(-1, 0),
    ];
    return cord.map((v) => this.add(v));
  }
  toString() {
    return `${this.x},${this.y}`;
  }
}
function parseInput(input: string) {
  return input
    .trim().split("\n").map((v) => v.split("").map((v) => ~~v));
}
