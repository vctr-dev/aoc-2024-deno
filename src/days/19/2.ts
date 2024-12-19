export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const { resources, patterns } = parseInput(input);
	let sum = 0;
	patterns.forEach((p) => sum += search(resources, p) || 0);
	console.log(sum);
}

function search(resources: string[], p: string) {
	const connections = new Map<number, number[]>();
	resources.forEach((r) => {
		let found = -1;
		const dest: number[] = [];
		while (true) {
			found = p.indexOf(r, found + 1);
			if (found < 0) break;
			dest.push(found);
		}
		const offset = r.length;
		dest.forEach((v) => {
			connections.set(v, [...connections.get(v) ?? [], v + offset]);
		});
	});

	// Find num paths
	const numPathsToNode = [1];
	for (let src = 0; src < p.length; src++) {
		const numPathsToSrc = numPathsToNode[src];
		if (!numPathsToSrc) continue;

		(connections.get(src) ?? []).forEach((dest) => {
			const numPathsToDest = numPathsToNode[dest] ?? 0;
			numPathsToNode[dest] = numPathsToDest + numPathsToSrc;
		});
	}
	// Num nodes to EOF node (past the end of string)
	return numPathsToNode[p.length];
}

function parseInput(input: string) {
	const [resources, patterns] = input
		.trim().split('\n\n');
	return { resources: resources.split(', '), patterns: patterns.split('\n') };
}
