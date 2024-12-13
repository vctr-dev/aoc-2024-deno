export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);
  const groups = getFenceGroup(parsed);

  let sum = 0;
  let sumPart2 = 0;
  groups.forEach((group) => {
    const p1 = getNonDiscountedParameter(group);
    const p2 = getDiscountedParameter(group);
    const a = getArea(group);
    sum += a * p1;
    sumPart2 += a * p2;
  });
  console.log("p1:", sum);
  console.log("p2:", sumPart2);
}
function getDirections(includeNone = false) {
  return [D.Top, D.Bottom, D.Left, D.Right, ...(includeNone ? [D.None] : [])];
}

function getDiscountedParameter(group: { d: D; p: V }[]) {
  const fences = getFences(group);
  const fenceMap = Map.groupBy(fences, (v) => v.d);
  return getDirections().map((d) => getNumSections(fenceMap, d)).reduce(
    (a, v) => a + v,
    0,
  );
}

function getNumSections(fenceMap: Map<D, { p: V; d: D }[]>, d: D) {
  const cross = (d === D.Left || d === D.Right) ? (v: V) => v.y : (v: V) => v.x;
  const straight = (d === D.Left || d === D.Right)
    ? (v: V) => v.x
    : (v: V) => v.y;
  return [
    ...Map.groupBy(fenceMap.get(d)!.map(({ p }) => p), straight)
      .values(),
  ].map((v) => v.map(cross).toSorted((a, b) => a - b)).map((v) => numConseq(v))
    .reduce(
      (a, v) => a + v,
      0,
    );
}

function numConseq(v: number[]) {
  let r = 1;
  for (let i = 1; i < v.length; i++) {
    if (v[i] - v[i - 1] > 1) {
      r++;
    }
  }
  return r;
}

function getNonDiscountedParameter(group: { d: D; p: V }[]) {
  return getFences(group).length;
}
function getFences(group: { d: D; p: V }[]) {
  return group.filter(({ d }) => d !== D.None);
}
function getArea(group: { d: D; p: V }[]) {
  return (new Set([
    ...group.map((v) => v.p.toString()),
  ])).size;
}

function getFenceGroup(map: Map<string, { p: V; v: string }>) {
  const connections: Map<string, Set<string>> = new Map(
    map.keys().map((k) => [k, new Set()]),
  );
  map.entries().forEach(([astr, { v, p }]) => {
    p.getNeigh().forEach((n) => {
      const bstr = n.toString();
      const { v: nv } = map.get(bstr) || {};
      if (!nv) return;

      if (v === nv) {
        connections.get(astr)!.add(bstr);
        connections.get(bstr)!.add(astr);
      }
    });
  });

  const processed = new Set();
  const groups: { d: D; p: V; id: string }[][] = [];
  connections.keys().forEach((k) => {
    if (processed.has(k)) return;
    const stack = [k];
    const group: { d: D; p: V; id: string }[] = [];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const item = stack.pop()!;
      const id = map.get(item)!.v;
      seen.add(item);
      processed.add(item);
      const iP = V.fromString(item);
      const c = [...connections.get(item)!.values()];
      stack.push(...c.filter((v) => !seen.has(v) && !stack.includes(v)));
      const dirs = c.map((p) => V.fromString(p)).map((p) => iP.dir(p));
      const fences = (new Set(getDirections(true)))
        .difference(
          new Set(dirs),
        );
      fences.forEach((f) => group.push({ d: f, p: iP, id }));
    }
    groups.push(group);
  });
  return groups;
}
function parseInput(input: string) {
  const collector = new Map<string, { v: string; p: V }>();
  input.trim().split("\n").map((r, y) =>
    r.split("").forEach((v, x) => {
      const p = new V(x, y);
      collector.set(p.toString(), { v, p });
    })
  );
  return collector;
}

enum D {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
  None = "none",
}
class V {
  constructor(public x: number, public y: number) {}
  static fromString(s: string) {
    const [x, y] = s.split(",").map((v) => parseInt(v));
    return new V(x, y);
  }
  add(v: V) {
    return new V(this.x + v.x, this.y + v.y);
  }
  getNeigh() {
    const dir = [
      new V(1, 0),
      new V(0, 1),
    ];
    return dir.map((v) => this.add(v));
  }
  dir(v: V) {
    if (v.x - this.x > 0) return D.Right;
    if (v.x - this.x < 0) return D.Left;
    if (v.y - this.y > 0) return D.Bottom;
    if (v.y - this.y < 0) return D.Top;
    return D.None;
  }

  toString() {
    return `${this.x},${this.y}`;
  }
}
