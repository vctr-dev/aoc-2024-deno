import { BinaryHeap } from 'jsr:@std/data-structures';

export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input) as [string, string][];
	const nodeMap = new Map<string, Set<string>>();
	parsed.forEach(([s, e]) =>
		nodeMap.set(s, (nodeMap.get(s) ?? new Set()).add(e))
	);
	const cluster = findLargestCluster(nodeMap)!;
	console.log(
		[...cluster.cluster, ...cluster.commonNodes].sort().join(','),
	);
}

function findLargestCluster(
	nodeMap: Map<string, Set<string>>,
) {
	const items = [...nodeMap.entries()]
		.filter((v) => v[0].startsWith('t'))
		.map(([k, v]) => ({ cluster: [k], commonNodes: v }));
	const heap = BinaryHeap.from(items, {
		compare: (a, b) =>
			b.cluster.length + b.commonNodes.size - a.cluster.length -
			a.commonNodes.size,
	});

	let last: typeof items[number] = items[0];
	while (heap.length) {
		const cur = heap.pop()!;

		// Terminating condition
		if (
			(cur.commonNodes.size + cur.cluster.length) <=
				last.cluster.length
		) {
			return last;
		}

		cur.commonNodes.forEach((node) => {
			const commonNodes = (nodeMap.get(node) || new Set())
				.intersection(cur.commonNodes)
				.difference(new Set(cur.cluster));
			heap.push({
				commonNodes,
				cluster: cur.cluster.toSpliced(0, 0, node),
			});
		});

		if (last.cluster.length < cur.cluster.length) last = cur;
	}
}

function parseInput(input: string) {
	return input
		.trim().split('\n').flatMap((v) => [v.split('-'), v.split('-').reverse()]);
}
