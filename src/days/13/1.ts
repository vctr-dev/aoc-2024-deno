type P = { x: number; y: number };
export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	// Part 1
	let sum = 0;
	parsed.forEach(({ a, b, p }) => {
		const comb = getCombinations(a, b, p);
		if (!comb) return;
		sum += comb.first * 3 + comb.second;
	});
	console.log(sum);
	// Part 2
}
function getCombinations(a: P, b: P, p: P) {
	const second = (p.x * a.y - a.x * p.y) / (a.y * b.x - a.x * b.y);
	const first = (p.y - second * b.y) / a.y;
	if (first.toString().includes('.') || second.toString().includes('.')) {
		return undefined;
	}

	return { first, second };
}

function parseInput(input: string) {
	return input
		.trim().split('\n\n').map((v) => {
			const [a, b, p] = v.split('\n').map((q) => {
				return q.split(': ').slice(1).map((r) => {
					const [x, y] = r.split(', ').map((s) => parseInt(s.slice(2)));
					return { x, y };
				}).pop()!;
			});

			return { a, b, p: { x: p.x + 10000000000000, y: p.y + 10000000000000 } };
		});
}
