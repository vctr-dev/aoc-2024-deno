import { sum } from "../../utils.ts";
export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);
  const res: number[][] = [];
  // Part 1
  // Find horizontals
  res.push(countMatrix(parsed));
  // Find verticals
  res.push(countMatrix(transposeMatrix(parsed)));
  // countMatrix
  // Find diagonals
  res.push(countMatrix(makeDiagonalMatrix(parsed)));
  res.push(countMatrix(makeDiagonalMatrix(mirrorX(parsed))));

  // Make matrix diagonal
  // Count
  // Make matrix diagonal
  // Count
  console.log("Part 1: " + sum(res.flat()));

  // Part 2
  const res2: number[] = [];
  const mask = ["M S", " A ", "M S"].map((v) => v.split(""));
  const mask2 = transposeMatrix(mask);
  const mask3 = mirrorX(mask);
  const mask4 = transposeMatrix(mask3);
  const masks = [mask, mask2, mask3, mask4];
  masks.forEach((m) => res2.push(countMask(parsed, m)));
  console.log("Part 2: " + sum(res2));
}

function parseInput(input: string) {
  return input
    .trim().split("\n").map((v) => v.split(""));
}

function count(input: string, ref: string) {
  return [...ref.matchAll(new RegExp(input, "g"))].length;
}

function countMatrix(m: string[][]) {
  const a = m.map((v) => v.join(""));
  const b = a.map((r) =>
    count("XMAS", r) + count("XMAS", r.split("").reverse().join(""))
  );
  return b;
}

function transposeMatrix<T>(m: T[][]) {
  const newMatrix: T[][] = [];
  m.forEach(() => newMatrix.push([]));
  m.forEach((r, y) => {
    r.forEach((v, x) => {
      newMatrix[x][y] = v;
    });
  });
  return newMatrix;
}

function makeDiagonalMatrix<T>(m: T[][]) {
  const res: T[][] = [];
  const maxY = m.length;
  const maxX = m[0].length;
  const startingCoord = [
    ...generateRowIndexes([0, 0], [maxY, maxX], [
      0,
      1,
    ]),
    ...generateRowIndexes([1, maxX - 1], [maxY, maxX], [1, 0]),
  ];
  startingCoord.forEach(([y, x]) => {
    const values = generateRowIndexes([y, x], [maxY, maxX], [+1, -1]).map((
      [y, x],
    ) => m[y][x]);
    res.push(values);
  });
  return res;
}

// y, x
// given starting and max index, generate list
// +1, -1 until either < 0 or > max row/column
function generateRowIndexes(
  [y, x]: [number, number],
  [maxY, maxX]: [number, number],
  [dirY, dirX]: [number, number],
): [number, number][] {
  const indexes: [number, number][] = [];
  let curX = x;
  let curY = y;
  while (curY < maxY && curX < maxX && curY >= 0 && curX >= 0) {
    indexes.push([curY, curX]);
    curY += dirY;
    curX += dirX;
  }
  return indexes;
}

function mirrorX<T>(m: T[][]) {
  return m.map((r) => r.toReversed());
}

function countMask<T>(m: T[][], mask: T[][]) {
  const maxY = m.length;
  const maxX = m[0].length;
  const maskMaxY = mask.length;
  const maskMaxX = mask[0].length;
  let count = 0;
  for (let y = 0; y < maxY; y++) {
    matrixRow: for (let x = 0; x < maxX; x++) {
      for (let maskY = 0; maskY < maskMaxY; maskY++) {
        for (let maskX = 0; maskX < maskMaxX; maskX++) {
          if (
            mask[maskY][maskX] !== " " &&
            m[y + maskY]?.[x + maskX] !== mask[maskY][maskX]
          ) {
            continue matrixRow;
          }
        }
      }
      count++;
    }
  }
  return count;
}
