import assert from "node:assert";
import chalk from "npm:chalk";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

type P = { x: number; y: number; v: string };

export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);
  const lookup = new Map<string, P>();
  let start;
  let end;
  parsed.forEach((p) => {
    const pStr = p.x + "," + p.y;
    if (p.v === "S") start = pStr;
    if (p.v === "E") end = pStr;
    lookup.set(pStr, p);
  });
  assert(start);
  assert(end);

  const { highScore, goodChairs, seen } = await search(start, end, lookup) ||
    {};
  // Part 1
  // checksum
  console.log(highScore);
  // Part 2
  console.log(goodChairs?.size);
  console.log(render(lookup, goodChairs, undefined, undefined, seen));
}

function render(
  lookup: Map<string, P>,
  visited?: Set<string>,
  highlight?: string,
  highlightIcon?: string,
  visitedPast?: Set<string>,
) {
  const res: string[][] = [];
  const vis = new Set([...visited || []].map((v) => v.split(";")[0]));
  const visPast = new Set([...visitedPast || []].map((v) => v.split(";")[0]));
  lookup.values().forEach(({ x, y, v }) => {
    const str = x + "," + y;
    if (!res[y]) {
      res[y] = [];
    }
    if (highlight && highlight === str) {
      res[y][x] = chalk.blue.bold.bgBlue(highlightIcon);
    } else if (vis && vis.has(str)) {
      res[y][x] = chalk.red.bold.bgRed("∘");
    } else if (visPast && visPast.has(str)) {
      res[y][x] = chalk.yellow.bold.bgYellow("∘");
    } else if (v === ".") {
      res[y][x] = chalk.black.bgBlack(".");
    } else {
      res[y][x] = chalk.green.dim(v);
    }
  });
  const output = res.map((v) => v.join("")).join("\n");
  return output;
}

enum D {
  N = "^",
  E = ">",
  W = "<",
  S = "v",
}
async function search(
  start: string,
  end: string,
  lookup: Map<string, P>,
) {
  const stack = [{
    points: 0,
    pos: start,
    dir: D.E,
    visited: new Map<string, number>(),
  }];
  const seen = new Set<string>();
  let highScore = 0;
  let goodChairs = new Set<string>();
  while (stack.length) {
    const cur = stack.pop();
    assert(cur);
    const { points, pos, dir } = cur;
    const visited = new Map(cur.visited);
    const str = [pos, dir].join(";");
    visited.set(str, points);

    if (pos === end) {
      if (!highScore) {
        highScore = points;
        goodChairs = new Set(visited.keys());
      } else if (highScore === points) {
        goodChairs = goodChairs.union(new Set(visited.keys()));
      } else {
        break;
      }
      continue;
    }

    if (seen.has(str)) {
      stack.forEach((item) => {
        const history = item.visited.get(str);
        if (history !== points) return;
        item.visited = new Map([...item.visited, ...visited]);
      });
      continue;
    }
    seen.add(str);

    // const output = render(lookup, new Set(visited.keys()), pos, dir, seen);
    // console.log(output);
    // await sleep(0.2);

    const [x, y] = pos.split(",").map((v) => parseInt(v));
    assert(x !== undefined && y !== undefined);

    leftRight(dir).forEach((d) => {
      const offset = getAheadVector(d);
      const newPos = (x + offset.x) + "," + (y + offset.y);
      const itemAtPos = lookup.get(newPos);
      const isWall = !itemAtPos || itemAtPos.v === "#";
      if (!isWall) {
        stack.unshift({ points: points + 1001, pos: newPos, dir: d, visited });
      }
    });

    // Try moving ahead
    const offset = getAheadVector(dir);
    const newPos = (x + offset.x) + "," + (y + offset.y);
    const itemAtPos = lookup.get(newPos);

    const isWall = !itemAtPos || itemAtPos.v === "#";
    if (!isWall) {
      stack.push({ points: points + 1, pos: newPos, dir, visited });
    }
    stack.sort((a, b) => b.points - a.points);
  }
  goodChairs = new Set([...goodChairs].map((v) => v.split(";")[0]));
  return { highScore, goodChairs, seen };
}

function leftRight(dir: D) {
  if (dir === D.N || dir === D.S) return [D.E, D.W];
  return [D.N, D.S];
}

function getAheadVector(dir: D) {
  switch (dir) {
    case D.N:
      return { x: 0, y: -1 };
    case D.S:
      return { x: 0, y: 1 };
    case D.E:
      return { x: 1, y: 0 };
    case D.W:
      return { x: -1, y: 0 };
  }
}

function parseInput(input: string) {
  const points: P[] = [];
  input
    .trim().split("\n").map((r, y) =>
      r.split("").forEach((v, x) => {
        points.push({ x, y, v });
      })
    );
  return points;
}
