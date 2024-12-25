export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const { locks, keys } = parseInput(input);
	const res = [];
	for (const key of keys) {
		for (const lock of locks) {
			if (key.every((v, i) => v + lock[i] <= 5)) {
				res.push([lock, key]);
			}
		}
	}
	console.log(res.length);
	// schematics: every top row filled, every bottom row empty
	// locks: top row filled,
	// keys: are bottom row filled
}

function parseInput(input: string) {
	const lockOrKey = input
		.trim().split('\n\n');
	const locks = lockOrKey
		.filter((v) => v.startsWith('#####'))
		.map((lock) => {
			return getCode(lock.split('\n').slice(1));
		});
	const keys = lockOrKey
		.filter((v) => v.startsWith('.....'))
		.map((key) => getCode(key.split('\n').reverse().slice(1)));
	return { locks, keys };
}

function getCode(rows: string[]) {
	const code = Array.from({ length: 5 }, () => 0);
	rows.forEach((row) =>
		row.split('').forEach((col, y) => {
			if (col === '#') {
				code[y] += 1;
			}
		})
	);
	return code;
}
