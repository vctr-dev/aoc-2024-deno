export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	const pos = [
		(a: number, b: number) => a + b,
		(a: number, b: number) => a * b,
		(a: number, b: number) => parseInt(`${a}${b}`), // For part 2, remove this
	];

	let result = 0;
	parsed.forEach(({ a, b }) => {
		const max = pos.length ** (b.length - 1);
		for (let i = 0; i < max; i++) {
			const comb = i.toString(pos.length).padStart(b.length - 1, '0').split('')
				.map((v) => pos[parseInt(v, 10)]);

			let res = b[0];
			for (let j = 0; j < b.length - 1; j++) {
				res = comb[j](res, b[j + 1]);
			}

			if (res === a) {
				result += a;
				break;
			}
		}
	});
	console.log(result);
}

function parseInput(input: string) {
	const a = input
		.trim().split('\n').map((v) => v.split(': '));
	return a.map(([b, c]) => ({
		a: parseInt(b, 10),
		b: c.split(' ').map((v) => parseInt(v, 10)),
	}));
}
