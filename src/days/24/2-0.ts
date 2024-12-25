export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const { initialWires: _, operations } = parseInput(input);
	const inputOutputMap = new Map<string, string>();
	for (const op of operations) {
		const key = opKeyGen(op);
		inputOutputMap.set(key, op.out);
	}

	const updateMap = (a: string, b: string, op: string, out: string) => {
		const key = opKeyGen({ a, b, op });
		return inputOutputMap.set(key, out);
	};

	const getOut = (a: string, b: string, op: string) => {
		if (op === 'OR' || op === 'XOR') {
			if (a === undefined || a === '0') return b;
			if (b === undefined || b === '0') return a;
		}
		const key = opKeyGen({ a, b, op });
		return inputOutputMap.get(key) || '0';
	};

	// Adders:
	// How Full adders work: for X<n>, Y<n>, and Z<n>
	// C - Carry bit
	// temp1[n] = X<n> XOR Y<n>, 0 if operation does not exist
	// temp2[n] = X<n> AND Y<n>, 0 if operation does not exist
	// temp3[n] = temp1[n] AND C[n-1]
	// C[n] = temp2[n] OR temp3[n], 0 if n < 0
	// Z<n> = temp1[n] XOR C[n-1]
	//
	// We can use Z<n> as checking for consistency.
	//
	// Semantic register mapping
	// 00 to 45
	const temp1: string[] = [];
	const temp2: string[] = [];
	const temp3: string[] = [];
	const carry: string[] = [];
	const swapped = [];
	// let's start with 00
	for (let i = 0; i < 45; i++) {
		const wireId = i.toString().padStart(2, '0');
		const xWire = 'x' + wireId;
		const yWire = 'y' + wireId;
		const zWire = 'z' + wireId;
		temp1[i] = getOut(xWire, yWire, 'XOR');
		temp2[i] = getOut(xWire, yWire, 'AND');
		temp3[i] = getOut(temp1[i], carry[i - 1], 'AND');
		carry[i] = getOut(temp2[i], temp3[i], 'OR');
		const res = getOut(temp1[i], carry[i - 1], 'XOR');
		if (res === zWire) continue;

		// fix it and run again
		if (temp1[i] === zWire) {
			updateMap(xWire, yWire, 'XOR', res);
			updateMap(temp1[i], carry[i - 1], 'XOR', zWire);
			swapped.push([res, zWire]);
		} else if (temp2[i] === zWire) {
			updateMap(xWire, yWire, 'AND', res);
			updateMap(temp1[i], carry[i - 1], 'XOR', zWire);
			swapped.push([res, zWire]);
		} else if (temp3[i] === zWire) {
			updateMap(temp1[i], carry[i - 1], 'AND', res);
			updateMap(temp1[i], carry[i - 1], 'XOR', zWire);
			swapped.push([res, zWire]);
		} else if (carry[i - 1] === zWire) {
			updateMap(temp2[i], temp3[i], 'OR', res);
			updateMap(temp1[i], carry[i - 1], 'XOR', zWire);
			swapped.push([res, zWire]);
		} else if (carry[i] === zWire) {
			updateMap(temp2[i], temp3[i], 'OR', res);
			updateMap(temp1[i], carry[i - 1], 'XOR', zWire);
			swapped.push([res, zWire]);
		} else if (temp3[i] === '0') {
			// swap temp 2 and temp 1
			updateMap(xWire, yWire, 'XOR', temp2[i]);
			updateMap(xWire, yWire, 'AND', temp1[i]);
			swapped.push([temp1[i], temp2[i]]);
		} else {
			console.log('Unable to autofix');
			console.log({
				xWire,
				yWire,
				zWire,
				temp1: temp1[i],
				temp2: temp2[i],
				temp3: temp3[i],
				currentCurry: carry[i],
				prevCarry: carry[i - 1],
				res,
				swapped,
			});
			break;
		}

		i--;
	}
	console.log(swapped.flat().sort().join(','));
}

function opKeyGen(op: { a: string; b: string; op: string }) {
	return [...[op.a, op.b].sort(), op.op].join(',');
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
