import assert from 'node:assert';
import { BinaryHeap } from 'https://deno.land/std@0.177.0/collections/binary_heap.ts';
export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const isExample = inputPath.includes('example');
	const limit = isExample ? 12 : 1024;
	const parsed = parseInput(input).slice(0, limit);
	const range = isExample ? 6 : 70;

	const start = '0,0';
	const end = range + ',' + range;
	const bytes = new Set(parsed);
	// Part 1
	// 0 - 70
	const { points, visited } = search(start, end, bytes, range)!;
	console.log(render(range, bytes, visited));
	console.log({ start, end, range, limit });
	console.log('part 1:', points);
	// example: 0-6
	// Part 2
}
function render(sides: number, map: Set<string>, visited: string[]) {
	const vis = new Set(visited);
	const lines = [];
	for (let y = 0; y <= sides; y++) {
		const line = [];
		for (let x = 0; x <= sides; x++) {
			line.push(
				map.has(x + ',' + y) ? '#' : vis.has(x + ',' + y) ? 'O' : '.',
			);
		}
		lines.push(line.join(''));
	}
	return lines.join('\n');
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
