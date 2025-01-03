import { zip } from 'jsr:@std/collections';
import { BinaryHeap } from 'https://deno.land/std@0.177.0/collections/binary_heap.ts';

type Point = { x: number; y: number; v?: string; str: string };
export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	const road = parsed.filter((v) => v.v !== '#');
	const start = road.find((v) => v.v === 'S')!;
	const end = road.find((v) => v.v === 'E')!;

	const mapSet = new Set<string>(road.map((v) => v.str));
	console.log(start, end);
	const noCheatPath = search(start, end, mapSet)! as [string, number][];

	findCheat(start, end, mapSet, noCheatPath);
}

function findCheat(
	start: Point,
	end: Point,
	mapSet: Set<string>,
	noCheatPath: [string, number][],
) {
	const pointsLookup = new Map(noCheatPath);
	const col: { p: number; srcPt: string; destPt: string }[] = [];
	noCheatPath.forEach(([srcPt, srcP]) => {
		// For each point on the path, list the surrounding jumpable wall
		// console.log(point, p);
		const [x, y] = srcPt.split(',').map((v) => parseInt(v));
		const po: Point = { x, y, str: srcPt };
		const dests = findDest(po, mapSet);
		// console.log({ dests });
		const ps = dests
			.map((d) => ({ srcPt, destPt: d.str, p: pointsLookup.get(d.str) }))
			.filter((d) => d.p)
			.map((d) => ({ ...d, p: d.p! - srcP - 2 }))
			.filter((d) => d.p > 0);
		col.push(...ps);
	});
	console.log(
		new Set(
			col
				.filter((v) => v.p >= 100)
				.toSorted((a, b) => a.p - b.p)
				.map((v) => [v.p, v.srcPt, v.destPt].join(',')),
		).size,
	);

	// For each wall, have we seen the wall before? if yes, ignore
	//
	// Assume jump succeed,
	// Destination on path and destination points less than source points? this means we jumped backwards. ignore
	// else savings = dest - src + 2
	//
	// if dest not on path, find how long it takes to get from dest to end
	// total time = src + 1 + time taken from dest to end
	//
	// Update no cheat paths with this path
}

function findDest(p: Point, map: Set<string>) {
	const near = genDir(p, 1);
	const far = genDir(p, 2);
	const points = zip(near, far);
	return points
		.filter(([n, f]) => !map.has(n.str) && map.has(f.str))
		.map(([_n, f]) => f);
}

function search(start: Point, end: Point, map: Set<string>) {
	// Find path with no cheat
	const heap = BinaryHeap
		.from([{
			...start,
			p: 0,
			path: [[start.str, 0]],
		}], {
			compare: (a, b) => a.p - b.p,
		});
	const seen = new Set<string>();
	while (heap.length) {
		const cur = heap.pop()!;
		// termination
		// If already seen, drop
		if (seen.has(cur.str)) {
			continue;
		}
		seen.add(cur.str);

		cur.path = cur.path.toSpliced(0, 0, [cur.str, cur.p]);
		// If end, return
		if (cur.str === end.str) {
			return cur.path;
		}

		genDir(cur, 1)
			.filter((p) => map.has(p.str))
			.map((p) => ({
				...p,
				p: cur.p + 1,
				path: cur.path,
			})).forEach((v) => heap.push(v));
	}
}

function genDir(p: Point, dist: number): Point[] {
	return [[dist, 0], [0, dist], [-1 * dist, 0], [0, -1 * dist]]
		.map(([x, y]) => [p.x + x, p.y + y])
		.map(([x, y]) => ({ x, y, str: getStr(x, y) }));
}
function getStr(x: number, y: number) {
	return `${x},${y}`;
}

function parseInput(input: string) {
	const points: Point[] = [];
	input
		.trim().split('\n').forEach((r, y) =>
			r.split('').forEach((v, x) => {
				points.push({ x, y, v, str: getStr(x, y) });
			})
		);
	return points;
}
