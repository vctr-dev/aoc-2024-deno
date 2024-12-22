import { distinct, maxOf, slidingWindows } from 'jsr:@std/collections';

export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	const c = parsed.map((v) => {
		let sn = v;
		let prev = undefined;
		const changes = [];
		for (let i = 0; i < 2000; i++) {
			prev = sn;
			const nextSn = next(sn);
			const change = nextSn % 10n - prev % 10n;
			sn = nextSn;
			changes.push({ price: nextSn % 10n, change });
		}
		return changes;
	});

	const acc = new Map<string, bigint>();
	c.map((v) => (getSeriesMap(v))).forEach((v) => {
		v.forEach(([series, val]) => {
			acc.set(series, (acc.get(series) ?? 0n) + val);
		});
	});
	console.log(maxOf(acc.values(), (v) => v));
}

function getSeriesMap(v: { price: bigint; change: bigint }[]) {
	const res: [string, bigint][] = [];
	const seen = new Set<string>();
	slidingWindows(v, 4).forEach((win) => {
		const str = win.map((s) => s.change).join(',');
		if (seen.has(str)) return;
		seen.add(str);
		res.push([str, win[3].price]);
	});
	return res;
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
