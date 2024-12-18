export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	// partOne(input);
	// Part 2
	partTwo(input);
}

function partTwo(input: string) {
	const { points, moves } = parseInput(input);
	const map = Map.groupBy(points, (v) => v.v[0]);
	const walls = new Set(map.get('#')!.map((v) => `${v.x},${v.y}`));
	const [robot] = map.get('@')!.values();
	const objects = Map.groupBy(map.get('O')!, (v) => v.v);
	moves.forEach((move) => {
		const dir = getDir(move);
		const objectLookup = new Map(
			[...objects.values()].flat().map(
				(v) => [`${v.x},${v.y}`, v],
			),
		);

		const stack = [robot];
		const group = [];
		const objectsSeen = new Set<string>();
		while (stack.length) {
			const next = stack.pop()!;
			group.push();
			const newPos = (new V(next.x, next.y)).add(dir).toString();
			// if it's a wall, we break
			if (walls.has(newPos)) {
				return;
			}

			const newPosObj = objectLookup.get(newPos);
			if (newPosObj && !objectsSeen.has(newPosObj.v)) {
				objectsSeen.add(newPosObj.v);
				stack.push(...objects.get(newPosObj.v)!);
			}
			group.push(next);
		}

		group.forEach((v) => {
			v.x += dir.x;
			v.y += dir.y;
		});
	});

	render(points);
	console.log(
		[...objects.values().map((v) => v[0])].reduce(
			(a, v) => a + 100 * v.y + v.x,
			0,
		),
	);

	function render(points: { v: string; x: number; y: number }[]) {
		const things: string[][] = [];
		const seenBox = new Set<string>();
		points.forEach(({ x, y, v }) => {
			const xa = things[y] || [];
			if (v.startsWith('O')) {
				xa[x] = seenBox.has(v) ? ']' : '[';
				seenBox.add(v);
			} else {
				xa[x] = v;
			}
			things[y] = xa;
		});
		console.log(
			Array.from(
				things,
				(r) => Array.from(r || ['.'], (v) => v || '.').join(''),
			).join('\n'),
		);
	}

	// group box by O<n>, O<n> etc
	// lookup to find if it's a box
	function parseInput(input: string) {
		const [a, b] = input
			.trim().split('\n\n');
		const moves = b.replaceAll('\n', '').split('');

		const rows = a.split('\n');

		let n = 0;
		const points = rows.flatMap((row, y) =>
			row.split('').flatMap((v, x) => {
				if (v === '#') {
					return [{ v, x: x * 2, y }, { v, x: x * 2 + 1, y }];
				}
				if (v === '.') {
					return [];
					// return [{ v, x: x * 2, y }, { v, x: x * 2 + 1, y }];
				}
				if (v === 'O') {
					n++;
					return [{ v: v + n, x: x * 2, y }, { v: v + n, x: x * 2 + 1, y }];
				}
				return [{ v, x: x * 2, y }, { v: '.', x: x * 2 + 1, y }];
			})
		);

		return { points, moves, width: rows[0].length * 2, height: rows.length };
	}
}

function getDir(move: string) {
	if (move === '<') return V.from('-1,0');
	if (move === '>') return V.from('1,0');
	if (move === '^') return V.from('0,-1');
	if (move === 'v') return V.from('0,1');
	throw new Error('Unrecognised Move: ${move}');
}

class V {
	constructor(public x: number, public y: number) {
	}
	static from(str: string) {
		const [x, y] = str.split(',').map((v) => parseInt(v, 10));
		return new V(x, y);
	}
	toString() {
		return `${this.x},${this.y}`;
	}
	add(v: V) {
		return new V(this.x + v.x, this.y + v.y);
	}
}

function partOne(input: string) {
	const { points, moves, width, height } = parseInput(input);
	const group = new Map(
		Map.groupBy(points, (v) => v.v)
			.entries()
			.map(([k, v]) => [k, new Set(v.map((q) => q.p))]),
	);
	// Part 1
	moves.forEach((move) => updateGroup(group, move));
	render(group, width, height);
	const p1 = group.get('O')?.values().map((v) => V.from(v)).reduce(
		(a, v) => v.y * 100 + v.x + a,
		0,
	);
	console.log({ p1 });

	function render(
		group: Map<string, Set<string>>,
		width: number,
		height: number,
	) {
		const lookup = getLookup(group);
		for (let y = 0; y < height; y++) {
			const line = [];
			for (let x = 0; x < width; x++) {
				line.push(lookup.get([x, y].join(',')) ?? ' ');
			}
			console.log(line.join(''));
		}
	}

	function getLookup(group: Map<string, Set<string>>) {
		const map = new Map<string, string>();
		group.entries().forEach(([k, v]) => v.forEach((p) => map.set(p, k)));
		return map;
	}

	function updateGroup(group: Map<string, Set<string>>, move: string) {
		const [robot] = group.get('@')!.values().map((v) => V.from(v));
		const dir = getDir(move);

		let closestBox;
		let freeSpace;

		let next = robot.add(dir);
		while (next) {
			if (isKind(group, next, '#')) break;
			if (isKind(group, next, '.')) {
				freeSpace = next.toString();
				break;
			}
			if (isKind(group, next, 'O')) {
				if (!closestBox) closestBox = next.toString();
			}
			next = next.add(dir);
		}

		if (!freeSpace) return;
		// Able to move
		const r = robot.toString();
		group.get('@')?.delete(r);
		group.get('.')?.delete(freeSpace);
		closestBox && group.get('O')?.delete(closestBox);

		group.get('.')?.add(r);
		group.get('@')?.add(robot.add(dir).toString());
		closestBox && group.get('O')?.add(freeSpace);
	}

	function isKind(group: Map<string, Set<string>>, v: V, kind: string) {
		const set = group.get(kind);
		if (!set) throw new Error(`Unrecognised kind: ${kind}`);
		return set.has(v.toString());
	}

	function parseInput(input: string) {
		const [a, b] = input
			.trim().split('\n\n');
		const moves = b.replaceAll('\n', '').split('');

		const rows = a.split('\n');
		const points = rows.flatMap((r, y) =>
			r.split('').map((v, x) => ({ p: `${x},${y}`, v }))
		);

		return { points, moves, width: rows[0].length, height: rows.length };
	}
}
