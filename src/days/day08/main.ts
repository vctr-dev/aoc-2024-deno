export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);
  // Part 1
  const col: Record<string, P[]> = {};
  parsed.forEach((r, y) =>
    r.forEach((v, x) => {
      const p = new P(x, y);
      col[v] = col[v] ? col[v].concat(p) : [p];
    })
  );
  delete col["."];
  const col2: Set<string> = new Set();
  Object.values(col).forEach((a) =>
    a.forEach((p1, i) => {
      const res = a.slice(i + 1);
      res.forEach((p2) => {
        [p2.move(p1.dir(p2)), p1.move(p2.dir(p1))].filter(
          (p) => (parsed[p.y]?.[p.x]),
        ).map((p) => p.toString()).forEach((v) => col2.add(v));
      });
    })
  );
  console.log("p1: " + col2.size);

  // Part 2
  const col3 = new Set<string>();
  Object.values(col).forEach((a) =>
    a.forEach((p1, i) => {
      const res = a.slice(i + 1);
      res.forEach((p2) => {
        [...generatePoints(p1, p2, parsed), ...generatePoints(p2, p1, parsed)]
          .map((p) => p.toString()).forEach((v) => col3.add(v));
      });
    })
  );
  console.log("p2: " + col3.size);
}

function generatePoints(p1: P, p2: P, map: string[][]) {
  const ret: P[] = [];
  let refP = p1;
  const dir = p1.dir(p2);
  while (true) {
    refP = refP.move(dir);
    if (!refP.isIn(map)) {
      break;
    }
    ret.push(refP);
  }
  return ret;
}

class P {
  constructor(public x: number, public y: number) {}
  dir(p: P) {
    return new P(p.x - this.x, p.y - this.y);
  }
  move(p: P) {
    return new P(this.x + p.x, this.y + p.y);
  }
  toString() {
    return `${this.x},${this.y}`;
  }
  isIn(map: unknown[][]) {
    return !!map[this.y]?.[this.x];
  }
}

function parseInput(input: string) {
  return input
    .trim().split("\n").map((v) => v.split(""));
}
