// get all the errors
// Find the wires involved in all the errors
// Subtract out all wires involved in the correct ones
// Let's see how wires are involved in the errors
// - if it's a small amount of wires, do trial and error

import { mapValues } from 'jsr:@std/collections';

// - if it's a large amount, we figure out another way
export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const { initialWires, operations } = parseInput(input);
	const wireMap = new Map<string, number>(
		initialWires.map(({ wire, v }) => [wire, v]),
	);
	const outMap = new Map(
		Object.entries(mapValues(
			Object.groupBy(operations, (v) => v.out),
			(v) => v![0],
		)),
	);

	const outputMap = runProg(wireMap, operations);
	const receivedZVal = getNumber('z', outputMap);
	const expectedZVal = getNumber('x', wireMap) + getNumber('y', wireMap);
	const wrongZBits = getDiffBits(receivedZVal, expectedZVal);
	const wrongZWires = new Set(
		wrongZBits
			.reverse()
			.map((v, i) => v === '1' ? `z${`${i}`.padStart(2, '0')}` : undefined)
			.filter(Boolean),
	);

	let candidates = new Set();
	wrongZWires.forEach((wire) => {
		const connected = getConnectedOutputs(outMap, wire!);
		candidates = candidates.union(connected);
	});

	const numWrongBits = wrongZWires.size;
	const overridesFound = [];
	for (const v of getComb([...candidates])) {
		const overrides = Object.fromEntries([v, v.toReversed()]);

		const result = runProg(wireMap, operations, overrides);
		const resultNum = getNumber('z', result);
		const resultWrongBits = getDiffBits(resultNum, expectedZVal).filter((v) =>
			v === '1'
		).length;

		if (resultWrongBits < numWrongBits) {
			overridesFound.push({ override: v, wrongBitsCount: resultWrongBits });
		}
	}
	const combinations = getComb(overridesFound)
		.filter((v) => (new Set(v.map((s) => s.override).flat())).size === 4)
		.map(([a, b]) => {
			return {
				overrides: [a.override, b.override],
				ceil: Math.min(a.wrongBitsCount, b.wrongBitsCount),
			};
		});
	console.log('First round: ', combinations.length);
	const newOverridesFound = [];
	for (const { overrides, ceil } of combinations) {
		const ov = Object.fromEntries([
			...overrides,
			...overrides.map((s) => s.toReversed()),
		]);

		const result = runProg(wireMap, operations, ov);
		const resultNum = getNumber('z', result);
		const resultWrongBits = getDiffBits(resultNum, expectedZVal).filter((v) =>
			v === '1'
		).length;

		if (resultWrongBits < ceil) {
			newOverridesFound.push({
				override: overrides,
				wrongBitsCount: resultWrongBits,
			});
		}
	}
	const newCombination = getComb(newOverridesFound)
		.filter((v) => {
			return (new Set(v.flatMap((s) => s.override.flat()))).size === 8;
		})
		.map(([a, b]) => {
			return {
				overrides: [...a.override, ...b.override],
			};
		});

	console.log('Second round: ', newCombination.length);
	let res: typeof newCombination[0]['overrides'] = [];
	for (const { overrides } of newCombination) {
		const ov = Object.fromEntries([
			...overrides,
			...overrides.map((s) => s.toReversed()),
		]);

		const result = runProg(wireMap, operations, ov);
		const resultNum = getNumber('z', result);
		const resultWrongBits = getDiffBits(resultNum, expectedZVal).filter((v) =>
			v === '1'
		).length;

		if (resultWrongBits === 0) {
			res = overrides;
			break;
		}
	}
	console.log(res);
}

type Op = { a: string; b: string; op: string; out: string };
function runProg(
	wireMap: Map<string, number>,
	operations: Op[],
	overrides: Record<string, string> = {},
) {
	const map = new Map(wireMap);
	const queue = [...operations];
	let max = operations.length ** 2;
	while (queue.length && max-- > 0) {
		const cur = queue.shift()!;
		const a = map.get(cur.a);
		const b = map.get(cur.b);
		if (a === undefined || b === undefined) {
			queue.push(cur);
			continue;
		}
		const outKey = overrides[cur.out] ?? cur.out;
		map.set(outKey, performOp(a, b, cur.op));
	}
	return map;
}

function getDiffBits(a: number, b: number) {
	return (a ^ b).toString(2).split('');
}
function getComb<T>(v: T[]) {
	const col: [T, T][] = [];
	for (let i = 0; i < v.length; i++) {
		for (let j = i + 1; j < v.length; j++) {
			col.push([v[i], v[j]]);
		}
	}
	return col;
}
function getConnectedOutputs(opMap: Map<string, Op>, output: string) {
	const col = new Set<string>();
	const stack = [output];
	const seen = new Set<string>();
	while (stack.length) {
		const cur = stack.pop()!;

		if (seen.has(cur)) continue;
		seen.add(cur);

		const op = opMap.get(cur);
		if (!op) continue;

		col.add(cur);
		stack.push(op.a, op.b);
	}
	return col;
}
function getNumber(prefix: string, map: Map<string, number>) {
	const bits = [...map.entries()]
		.filter((v) => v[0].startsWith(prefix))
		.toSorted((a, b) => a[0].localeCompare(b[0]))
		.map((v) => v[1])
		.toReversed().join('');
	return parseInt(bits, 2);
}
function performOp(a: number, b: number, op: string) {
	if (op === 'AND') return a & b;
	if (op === 'OR') return a | b;
	return a ^ b;
}
function parseInput(input: string) {
	const [a, b] = input
		.trim().split('\n\n');
	const initialWires = a.split('\n').map((v) => v.split(': ')).map((
		[wire, v],
	) => ({
		wire,
		v: parseInt(v),
	}));
	const operations = b.split('\n').map((v) => v.split(' ')).map((
		[a, op, b, _, out],
	) => ({ a, op, b, out }));
	return { initialWires, operations };
}
