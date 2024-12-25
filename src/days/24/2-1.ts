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
	const outputMap = runProg(wireMap, operations);
	const receivedZVal = getNumber('z', outputMap);
	const xVal = getNumber('x', wireMap);
	const yVal = getNumber('y', wireMap);
	const expectedZVal = xVal + yVal;
	const allZWires = new Set(outputMap.keys().filter((k) => k.startsWith('z')));
	const wrongZBits = receivedZVal ^ expectedZVal;
	const wrongZWires = new Set(
		wrongZBits
			.toString(2)
			.split('')
			.reverse()
			.map((v, i) => v === '1' ? `z${`${i}`.padStart(2, '0')}` : undefined)
			.filter(Boolean),
	);
	const rightZWires = allZWires.difference(wrongZWires);

	const outMap = new Map(
		Object.entries(mapValues(
			Object.groupBy(operations, (v) => v.out),
			(v) => v![0],
		)),
	);

	let candidates = new Set();
	wrongZWires.forEach((wire) => {
		const connected = getConnectedOutputs(outMap, wire!);
		candidates = candidates.union(connected);
	});
	console.log([...candidates.values()].length);
}

type Op = { a: string; b: string; op: string; out: string };
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

function runProg(
	wireValues: Map<string, number>,
	operations: Op[],
) {
	const map = new Map(wireValues);
	const queue = [...operations];
	while (queue.length) {
		const cur = queue.shift()!;
		const a = map.get(cur.a);
		const b = map.get(cur.b);
		if (a === undefined || b === undefined) {
			queue.push(cur);
			continue;
		}
		map.set(cur.out, performOp(a, b, cur.op));
	}
	return map;
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
