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
		[...cluster.currentCluster, ...cluster.commonNodes].sort().join(','),
	);
}

function findLargestCluster(
	nodeMap: Map<string, Set<string>>,
) {
	const items = [...nodeMap.entries()].filter((v) => v[0].startsWith('t')).map((
		[k, v],
	) => ({
		currentCluster: [k],
		commonNodes: v,
	}));
	const heap = BinaryHeap.from(items, {
		compare: (a, b) =>
			b.currentCluster.length + b.commonNodes.size - a.currentCluster.length -
			a.commonNodes.size,
	});

	// First, for each item, we make a pair of {currentCluster: [], commonNodes: Set<string>}
	//
	// Pick the one with the most common nodes + cluster
	// Find the largest cluster within that common nodes
	// Collect it and combine it with the current cluster (maybe largest cluster)
	//
	// Next, we pick the one with the next most common nodes  size + cluster size
	// If the common node size plus the cluster size is less than the largest cluster, we confirmed that we have found the largest cluster. Return it.
	let last: typeof items[number] = items[0];
	while (heap.length) {
		const cur = heap.pop()!;
		// Terminating condition
		if (
			(cur.commonNodes.size + cur.currentCluster.length) <=
				last.currentCluster.length
		) {
			return last;
		}
		cur.commonNodes.forEach((node) => {
			const connections = nodeMap.get(node) || new Set();
			const commonNodes = cur.commonNodes.intersection(connections).difference(
				new Set(cur.currentCluster),
			);
			heap.push({
				commonNodes,
				currentCluster: cur.currentCluster.toSpliced(0, 0, node),
			});
		});
		last = cur;
	}
}

function parseInput(input: string) {
	return input
		.trim().split('\n').flatMap((v) => [v.split('-'), v.split('-').reverse()]);
}
