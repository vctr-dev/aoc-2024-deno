export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const robots = parseInput(input);
  // Part 1
  const width = inputPath.includes("example") ? 11 : 101;
  const height = inputPath.includes("example") ? 7 : 103;
  const midWidth = Math.floor(width / 2);
  const midHeight = Math.floor(height / 2);
  for (let i = 0; i < 10000000; i++) {
    robots.forEach((robot) => robot.tick());
    const positions = robots.map((r) => r.normalizedP(width, height));
    console.log("T:", i + 1);
    const topLeft = getQuad(
      positions,
      new V(0, 0),
      new V(midWidth - 1, midHeight - 1),
    ).length;
    const topRight = getQuad(
      positions,
      new V(midWidth + 1, 0),
      new V(width - 1, midHeight - 1),
    ).length;
    const botLeft = getQuad(
      positions,
      new V(0, midHeight + 1),
      new V(midWidth - 1, height - 1),
    ).length;
    const botRight = getQuad(
      positions,
      new V(midWidth + 1, midHeight + 1),
      new V(width - 1, height - 1),
    ).length;
    const checksum1 = topLeft * topRight * botLeft * botRight;
    // console.log("p1:", checksum1);
    const s = new Set<string>();
    positions.forEach((v) => s.add(v.toString()));
    const uniqPositions = s.size === robots.length;
    if (uniqPositions) {
      render(positions, width, height);
      prompt("next");
    }
  }
}

function render(positions: V[], width: number, height: number) {
  const s = new Set<string>();
  positions.forEach((v) => s.add(v.toString()));
  for (let y = 0; y < height; y++) {
    const line: string[] = [];
    for (let x = 0; x < width; x++) {
      line.push(s.has(`${x},${y}`) ? "■" : " ");
    }
    console.log(line.join(""));
  }
}

function getQuad(positions: V[], lowerBound: V, upperBound: V) {
  return positions.filter((v) =>
    v.x >= lowerBound.x &&
    v.y >= lowerBound.y &&
    v.x <= upperBound.x &&
    v.y <= upperBound.y
  );
}

function parseInput(input: string) {
  const a = input
    .trim().split("\n");
  const b = a.map((v) =>
    v.split(" ").map((x) =>
      V.fromArray(x.split("=")[1].split(",").map((y) => parseInt(y)))
    )
  ).map(([p, v]) => new Robot(p, v));
  return b;
}

class V {
  constructor(public x: number, public y: number) {
  }

  static fromArray([x, y]: number[]) {
    return new V(x, y);
  }

  add(v: V) {
    return new V(this.x + v.x, this.y + v.y);
  }
  toString() {
    return `${this.x},${this.y}`;
  }
}

class Robot {
  constructor(public p: V, public v: V) {
  }
  tick() {
    this.p = this.p.add(this.v);
  }
  normalizedP(width: number, height: number) {
    let x = this.p.x % width;
    if (x < 0) x += width;
    x = Math.abs(x);
    let y = this.p.y % height;
    if (y < 0) y += height;
    y = Math.abs(y);
    return new V(x, y);
  }
}
