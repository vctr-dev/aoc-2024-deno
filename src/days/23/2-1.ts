export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input) as [string, string][];
	const nodeMap = new Map<string, Set<string>>();
	parsed.forEach(([s, e]) =>
		nodeMap.set(s, (nodeMap.get(s) ?? new Set()).add(e))
	);
	console.log(nodeMap);
	const col: string[][] = [];
	let seen = new Set<string>();
	nodeMap.keys().forEach((v) => {
		if (seen.has(v)) {
			return;
		}
		const connections = findConnections(v, nodeMap);
		col.push(connections);
		seen = seen.union(new Set(connections));
		console.log(connections);
	});
	console.log(col.filter((v) => v.length));
}

function findConnections(
	node: string,
	nodeMap: Map<string, Set<string>>,
) {
	const stack = [{ node, connections: [] as string[] }];
	let col: string[] = [];
	while (stack.length) {
		const cur = stack.shift()!;
		const next: Set<string> = nodeMap.get(cur.node) ?? new Set();
		const curConnection = new Set(cur.connections);

		// next must have connection to all the nodes in this node
		if (!next.isSupersetOf(curConnection)) continue;
		if (col.length < cur.connections.length) {
			col = [...cur.connections, cur.node];
		}
		console.log(cur.connections);

		// Do not go through things that we have seen before
		next.difference(curConnection).values().forEach((v) =>
			stack.push({
				node: v,
				connections: cur.connections.toSpliced(0, 0, cur.node),
			})
		);
		console.log(stack.length);
	}
	return col;
}

function parseInput(input: string) {
	return input
		.trim().split('\n').flatMap((v) => [v.split('-'), v.split('-').reverse()]);
}
