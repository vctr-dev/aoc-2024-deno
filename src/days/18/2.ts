import assert from 'node:assert';
import { BinaryHeap } from 'https://deno.land/std@0.177.0/collections/binary_heap.ts';

export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);

	const isExample = inputPath.includes('example');
	const limit = isExample ? 12 : 1024;
	const range = isExample ? 6 : 70;

	// Part 1
	// 0 - 70
	const index = findBlockingPixelIndex(limit, input.length - 1, parsed, range)!;
	console.log('part 2:', parsed[index]);
	// example: 0-6
	// Part 2
}
function findBlockingPixelIndex(
	startIndex: number,
	endIndex: number,
	fullMap: string[],
	side: number,
) {
	const startC = '0,0';
	const endC = side + ',' + side;
	let startI = startIndex;
	let endI = endIndex;
	const visited: Set<string>[] = [];
	while (true) {
		const curI = Math.ceil((endI - startI) / 2) + startI;
		// terminating conditions
		if (curI === endI) {
			return curI;
		}
		const map = new Set(fullMap.slice(0, curI + 1));
		let isFound;
		if (visited.find((v) => v.isDisjointFrom(map))) {
			isFound = true;
		} else {
			const res = search(startC, endC, map, side);
			isFound = !!res;
			res && visited.push(new Set(res.visited));
		}

		if (isFound) {
			// select right
			startI = curI;
		} else {
			// select left
			endI = curI;
		}
	}
}

function search(start: string, end: string, map: Set<string>, sides: number) {
	const heap = BinaryHeap.from(
		[{ pos: start, points: 0, visited: [start] }],
		{ compare: (a, b) => a.points - b.points },
	);
	const seen = new Set<string>();
	while (heap.length) {
		const { pos, points, visited } = heap.pop()!;

		const [x, y] = pos.split(',').map((v) => parseInt(v));
		assert(x !== undefined && y !== undefined);
		// term
		if (x < 0 || x > sides || y < 0 || y > sides) continue;
		// has seen this before, drop
		if (seen.has(pos)) {
			continue;
		}
		// is a wall, drop
		if (map.has(pos)) {
			continue;
		}
		if (pos === end) {
			return { pos, points, visited };
		}
		seen.add(pos);

		// Generate next points
		heap.push(
			{
				pos: (x + 1) + ',' + (y + 0),
				points: points + 1,
				visited: [...visited, (x + 1) + ',' + (y + 0)],
			},
			{
				pos: (x - 1) + ',' + (y + 0),
				points: points + 1,
				visited: [...visited, (x - 1) + ',' + (y + 0)],
			},
			{
				pos: (x + 0) + ',' + (y - 1),
				points: points + 1,
				visited: [...visited, (x + 0) + ',' + (y - 1)],
			},
			{
				pos: (x + 0) + ',' + (y + 1),
				points: points + 1,
				visited: [...visited, (x + 0) + ',' + (y + 1)],
			},
		);
	}
}

function parseInput(input: string) {
	return input
		.trim().split('\n');
}
