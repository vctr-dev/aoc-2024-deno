export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);
  const map = new Map<string, { p: V; v: string }>();
  parsed.forEach((r, y) => {
    r.forEach((v, x) => {
      const p = new V(x, y);
      map.set(p.toString(), { p, v });
    });
  });

  const connections = new Map<string, Set<string>>();
  let orphansCount = 0;
  map.values().forEach(({ p, v }) => {
    const adj = p.getNeigh();
    const astr = p.toString();
    adj.forEach((adjP) => {
      const bstr = adjP.toString();

      const { v: adjV } = map.get(bstr) ?? {};
      if (adjV !== v) return;

      [[astr, bstr], [bstr, astr]].forEach(([a, b]) => {
        connections.get(a)?.add(b) ??
          connections.set(a, new Set([b]));
      });
    });
    if (!connections.has(astr)) {
      orphansCount++;
    }
  });

  // Part 1
  console.log("p1:", getPartOneResult(connections) + orphansCount * 4);

  // Part 2
  console.log("p2:", getPartTwoResults(connections) + orphansCount * 4);
}

function getPartTwoResults(connections: Map<string, Set<string>>) {
  const processed = new Set<string>();
  let res = 0;
  connections.keys().forEach((p) => {
    if (processed.has(p)) return;

    // Group start
    const stack = [p];
    let area = 0;
    const fences: { p: V; d: D }[] = [];
    while (stack.length) {
      const a = stack.pop();
      if (!a) throw new Error("Invalid state 1");
      if (processed.has(a)) continue;
      processed.add(a);
      const c = connections.get(a);
      if (!c) throw new Error("Invalid state 2");
      stack.push(...c);

      // Process node of a group
      area++;
      // gather fence information
      const f = new Set<D>();
      const aV = V.fromString(a);
      const newSet = new Set([D.Top, D.Bottom, D.Left, D.Right]);
      c.forEach((v) => newSet.delete(aV.dir(V.fromString(v))));
      fences.push(...newSet.values().map((v) => ({ d: v, p: aV })));
    }
    // Group end

    const conseqSides = numConseqSides(fences);
    console.log({ area, conseqSides });
    res += area * conseqSides;
  });
  return res;
}

function numConseqSides(fenceInfo: { p: V; d: D }[]) {
  const group = Map.groupBy(
    fenceInfo,
    (v) => v.d,
  );
  // Check up
  let sum = 0;
  getRows(group.get(D.Top) ?? [], (v) => v.y, (v) => v.x).forEach((v) => {
    sum += numSections(v);
  });
  getRows(group.get(D.Bottom) ?? [], (v) => v.y, (v) => v.x).forEach((v) => {
    sum += numSections(v);
  });
  getRows(group.get(D.Left) ?? [], (v) => v.x, (v) => v.y).forEach((v) => {
    sum += numSections(v);
  });
  getRows(group.get(D.Right) ?? [], (v) => v.x, (v) => v.y).forEach((v) => {
    sum += numSections(v);
  });

  return sum;
}

function getRows(
  input: { p: V; d: D }[],
  cross: (p: V) => number,
  straight: (p: V) => number,
) {
  return Map.groupBy(input, (v) => cross(v.p)).values().map((v) =>
    v.map((v) => straight(v.p)).toSorted()
  );
}

function numSections(v: number[]) {
  let ret = 1;
  for (let i = 1; i < v.length; i++) {
    if (v[i] - v[i - 1] > 1) {
      ret++;
    }
  }
  return ret;
}

function getPartOneResult(connections: Map<string, Set<string>>) {
  const processed = new Set<string>();
  let res = 0;
  connections.keys().forEach((p) => {
    if (processed.has(p)) return;
    const stack = [p];
    let area = 0;
    let parameter = 0;
    while (stack.length) {
      const a = stack.pop();
      if (!a) throw new Error("Invalid state 1");
      if (processed.has(a)) continue;
      processed.add(a);
      const c = connections.get(a);
      if (!c) throw new Error("Invalid state 2");
      area++;
      parameter += 4 - c.size;
      stack.push(...c);
    }
    res += area * parameter;
  });
  return res;
}

function parseInput(input: string) {
  return input
    .trim().split("\n").map((v) => v.split(""));
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
