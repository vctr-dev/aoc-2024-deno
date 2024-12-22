export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	let sum = 0n;
	parsed.forEach((v) => {
		let sn = v;
		for (let i = 0; i < 2000; i++) {
			sn = next(sn);
		}
		sum += sn;
	});
	console.log(sum);
}

function next(prev: bigint) {
	let sn = prev;
	sn = prune(mix(64n * sn, sn));
	sn = prune(mix(sn / 32n, sn));
	sn = prune(mix(sn * 2048n, sn));
	return sn;
}
function mix(num: bigint, secret: bigint) {
	return num ^ secret;
}
function prune(num: bigint) {
	return num % 16777216n;
}

function parseInput(input: string) {
	return input
		.trim()
		.split('\n')
		.map((v) => BigInt(parseInt(v)));
}
