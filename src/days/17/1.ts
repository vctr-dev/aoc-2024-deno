type Reg = { a: number; b: number; c: number; ip: number; out: number[] };
export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const { a, b, c, prog } = parseInput(input);
	// program: 3-bit numbers
	// registers: a, b, c
	// instructions: 8 types
	// opcode: 3-bit number, identies instructions
	// operand: 3-bit number, input for instructions
	// two types, determine by opcode
	// - literal (is operand itself)
	// - combo:
	// -- 0-3: literal
	// -- 4 -> regA
	// -- 5 -> regB
	// -- 6 -> regC
	// -- 7 --> never
	//
	// instruction format: <opcode><operand>
	// instruction pointer: pos of opcode part of instructions
	// increases by 2 after each instructions is process (opcode and operand)
	// except jump instructions
	//
	// if past the program, halts
	const instructions = new Map<number, (reg: Reg, input: number) => unknown>();
	instructions.set(0, adv);
	instructions.set(1, bxl);
	instructions.set(2, bst);
	instructions.set(3, jnz);
	instructions.set(4, bxc);
	instructions.set(5, out);
	instructions.set(6, bdv);
	instructions.set(7, cdv);

	const reg: Reg = { a, b, c, ip: 0, out: [] };
	while (reg.ip < prog.length - 1) {
		const [oc, op] = [prog[reg.ip], prog[reg.ip + 1]];
		instructions.get(oc)?.(reg, op);
		reg.ip = reg.ip + 2;
	}
	console.log('part 1:', reg.out.join(','));

	// Part 2
	// inversion?
	// Given end state, am I able to work out how to get to the beginning?
	// How can I get to the end? Jump, or next
	// For that point, how do I get there? jump, or next (branch point)
	// Graph of instruction path?
	// Find all instruction paths with x number of outs
	const progLength = prog.length;
	console.log(prog);
	const col = [];
	const stack: {
		curIp: number;
		ins: { ocop: [number, number]; meta?: string }[];
		numOutSeen: number;
	}[] = [{
		curIp: 0,
		ins: [],
		numOutSeen: 0,
	}];
	while (stack.length) {
		const { curIp, ins, numOutSeen } = stack.pop()!;
		const [oc, op] = [prog[curIp], prog[curIp + 1]];

		// Check terminating conditions
		if (oc === undefined || op === undefined) {
			if (numOutSeen === progLength) col.push(ins);
			continue;
		}
		if (numOutSeen > prog.length) continue;

		if (oc === 5) {
			stack.push({
				curIp: curIp + 2,
				ins: [...ins, {
					ocop: [oc, op],
					meta: `out: ${c2vStr(op)} % 8 === ${prog[numOutSeen]}`,
				}],
				numOutSeen: numOutSeen + 1,
			});
			continue;
		}
		// if is jump, add branches to stack
		if (oc === 3) {
			// If no jump
			stack.push({
				curIp: curIp + 2,
				ins: [...ins, {
					ocop: [oc, op],
					meta: `jnz reg.a === 0`,
				}],
				numOutSeen,
			});
			stack.push({
				curIp: op,
				ins: [...ins, {
					ocop: [oc, op],
					meta: `jnz: reg.a !== 0`,
				}],
				numOutSeen,
			});
			continue;
		}
		stack.push({
			curIp: curIp + 2,
			ins: [...ins, { ocop: [oc, op], meta: insToStr(oc, op) }],
			numOutSeen,
		});
	}

	const formula = (a: bigint) =>
		(((a % 8n) ^ 3n) ^ 5n ^ (a >> ((a % 8n) ^ 3n))) % 8n;
	const it: bigint[] = [];
	for (let i = 0n; i < 8n; i++) it.push(i);
	const ltr = prog.toReversed();

	let trial = [0n];
	for (const output of ltr) {
		trial = trial.flatMap((v) => it.map((b) => (v << 3n) + b)).filter((v) => {
			return formula(v) === BigInt(output);
		});
	}

	console.log(
		'part 2:',
		trial.toSorted((a, b) => a === 0n ? 0 : (a > b) ? 1 : -1)[0],
	);
}
function c2vStr(input: number) {
	if (input <= 3) return `${input}`;
	if (input === 4) return 'reg.a';
	if (input === 5) return 'reg.b';
	return 'reg.c';
}

function insToStr(oc: number, op: number) {
	if (oc === 1) {
		return `bxl: reg.b = reg.b ^ ${op}`;
	}

	if (oc === 4) {
		return `bxc: reg.b = reg.b ^ reg.c`;
	}

	if (oc === 2) {
		return `bst: reg.b = ${c2vStr(op)} % 8`;
	}

	if (oc === 0) {
		return `adv: reg.a = reg.a >> ${c2vStr(op)}`;
	}
	if (oc === 6) {
		return `bdv: reg.b = reg.a >> ${c2vStr(op)}`;
	}
	if (oc === 7) {
		return `cdv: reg.c = reg.a >> ${c2vStr(op)}`;
	}
}

function jnz(reg: Reg, input: number) {
	if (reg.a !== 0) reg.ip = input - 2;
}
// shift right
function adv(reg: Reg, input: number) {
	reg.a = dv(reg, input);
} // shift right
function bdv(reg: Reg, input: number) {
	reg.b = dv(reg, input);
}

// shift right
function cdv(reg: Reg, input: number) {
	reg.c = dv(reg, input);
}

// shift right
function dv(reg: Reg, input: number) {
	return reg.a >> c2v(reg, input);
}

// 3 bit, xor with input
function bxl(reg: Reg, input: number) {
	reg.b = reg.b ^ input;
}
//
// bit xor operation
function bxc(reg: Reg, _input: number) {
	reg.b = reg.b ^ reg.c;
}

// 3 bit of c2v
function bst(reg: Reg, input: number) {
	reg.b = c2v(reg, input) % 8;
}

// Prints out last three bits
function out(reg: Reg, input: number) {
	const output = c2v(reg, input) % 8;
	reg.out = [...reg.out, output];
}

function c2v(reg: Reg, input: number) {
	if (input <= 3) return input;
	if (input === 4) return reg.a;
	if (input === 5) return reg.b;
	return reg.c;
}

function parseInput(input: string) {
	const [a, b] = input
		.trim().split('\n\n');
	const reg = a.split('\n').map((v) => {
		return parseInt(v.split(': ')[1]);
	});
	const prog = b.split(': ')[1].split(',').map((v) => parseInt(v));
	return { a: reg[0], b: reg[1], c: reg[2], prog };
}
