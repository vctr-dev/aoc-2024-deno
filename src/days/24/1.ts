export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	const wireValues = new Map<string, number>(
		parsed.initialWires.map(({ wire, v }) => [wire, v]),
	);
	const queue = parsed.operations;
	while (queue.length) {
		const cur = queue.shift()!;
		const a = wireValues.get(cur.a);
		const b = wireValues.get(cur.b);
		if (a === undefined || b === undefined) {
			queue.push(cur);
			continue;
		}
		wireValues.set(cur.out, performOp(a, b, cur.op));
	}
	const bits = [...wireValues.entries()]
		.filter((v) => v[0].startsWith('z'))
		.toSorted((a, b) => a[0].localeCompare(b[0]))
		.map((v) => v[1])
		.toReversed().join('');
	console.log(parseInt(bits, 2));
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
