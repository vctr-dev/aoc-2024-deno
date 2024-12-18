export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	// Part 1
	const output = decode(parsed);
	const reversed = output.toReversed().filter((v) => v !== '.');
	let max = 1_000_000;
	while (hasGap(output) && max-- > 0) {
		const freeSpaceIndex = output.findIndex((v) => v === '.');
		output[freeSpaceIndex] = reversed.shift()!;
		// removeLastDigit and any dots at the back
		while (!Number.isInteger(output.pop())) {
			// Don't need to do anything here
		}
	}
	if (max <= 0) throw new Error('Max loop');
	console.log('p1: ', checksum(output));
	//  Part 2
	const a = grouped(parsed);
	const filesOnly = a.filter((v) => v.fileID !== '.').toReversed();
	filesOnly.forEach((file) => {
		// Find a slot for file, but before it hit that file
		for (let i = 0; i < a.length; i++) {
			const cur = a[i];
			if (cur.fileID !== '.' && cur.fileID === file.fileID) {
				break;
			}
			if (cur.fileID === '.') {
				if (cur.numberBlocks >= file.numberBlocks) {
					cur.numberBlocks -= file.numberBlocks;
					// replace existing fileID to dots
					a.splice(
						i,
						0,
						{ ...file },
					);
					const b = a.findLast((v) => v.fileID === file.fileID);
					if (b) b.fileID = '.';
					break;
				}
			}
		}
	});

	const c = encode(a);
	console.log('p2: ', checksum(c));
}

type File = {
	fileID: number | string;
	numberBlocks: number;
};

function encode(v: File[]) {
	let ret: (string | number)[] = [];
	v.forEach(({ fileID, numberBlocks }) =>
		ret = [...ret, ...Array(numberBlocks).fill(fileID)]
	);
	return ret;
}

function hasGap(v: unknown[]) {
	return /\.\d/.test(v.join(''));
}

function grouped(v: number[]) {
	return v.map((x, i) => ({
		fileID: i % 2 ? '.' : Math.floor(i / 2),
		numberBlocks: x,
	}));
}
function decode(v: number[]) {
	let isBlock = true;
	let fileID = 0;
	let out: (number | string)[] = [];
	v.forEach((a) => {
		out = [...out, ...Array(a).fill(isBlock ? `${fileID}` : '.')];
		if (isBlock) {
			fileID++;
		}
		isBlock = !isBlock;
	});
	return out;
}

function parseInput(input: string) {
	return input
		.trim().split('').map((v) => ~~v);
}

function checksum(v: (string | number)[]) {
	let sum = 0;
	v.map((a) => Number.isInteger(a) ? a : 0).forEach((a, i) =>
		sum += a as number * i
	);
	return sum;
}
