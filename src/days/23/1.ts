export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input) as [string, string][];
	const nodeMap = new Map<string, string[]>();
	parsed.forEach(([s, e]) => nodeMap.set(s, [...(nodeMap.get(s) ?? []), e]));
	const col = [];
	nodeMap.keys().forEach((v) => {
		const connections = findConnections(v, nodeMap);
		col.push(...connections.filter((v) => v.find((q) => q.startsWith('t'))));
	});
	console.log(col.length / 6);
}

function findConnections(
	node: string,
	nodeMap: Map<string, string[]>,
) {
	const stack = [[node]];
	const col = [];
	while (stack.length) {
		const cur = stack.pop()!;
		// term
		const next = nodeMap.get(cur[cur.length - 1]) ?? [];

		if (cur.length === 3) {
			if (next.includes(cur[0])) {
				col.push(cur);
			}
			continue;
		}

		next.filter((v) => !cur.includes(v)).forEach((v) =>
			stack.push([...cur, v])
		);
	}
	return col;
}

function parseInput(input: string) {
	return input
		.trim().split('\n').flatMap((v) => [v.split('-'), v.split('-').reverse()]);
}
