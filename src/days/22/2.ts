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

	const s = c.map((v) => ({ ...v, seriesMap: getSeriesMap(v) }));
	const possibleSeries = distinct(s.flatMap((v) => [...v.seriesMap.keys()]));
	const res = possibleSeries.map((series) =>
		s.map((v) => v.seriesMap.get(series)).reduce(
			(a, c) => (a ?? 0n) + (c ?? 0n),
			0n,
		)!
	);
	console.log(maxOf(res, (v) => v));
}

function getSeriesMap(v: { price: bigint; change: bigint }[]) {
	const map = new Map<string, bigint>();
	slidingWindows(v, 4).forEach((win) => {
		const str = win.map((s) => s.change).join(',');
		if (map.has(str)) return;
		map.set(str, win[3].price);
	});
	return map;
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
