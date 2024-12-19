export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const { resources, patterns } = parseInput(input);
	let sum = 0;
	patterns.forEach((p) => sum += search(resources, p) || 0);
	console.log(sum);
	// console.log(search(resources, 'gbbr'));
	// const res = sum(parsed.patterns.map((p) => search(atomicResources, p)));
	// console.log(res);
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
	const numPathsToNode = new Map<number, number>([[0, 1]]);
	for (let src = 0; src < p.length; src++) {
		const numPathsToSrc = numPathsToNode.get(src);
		if (!numPathsToSrc) continue;

		(connections.get(src) ?? []).forEach((dest) => {
			const numPathsToDest = numPathsToNode.get(dest) ?? 0;
			numPathsToNode.set(dest, numPathsToDest + numPathsToSrc);
		});
	}
	// Num nodes to EOF node (past the end of string)
	return numPathsToNode.get(p.length);
}

function parseInput(input: string) {
	const [resources, patterns] = input
		.trim().split('\n\n');
	return { resources: resources.split(', '), patterns: patterns.split('\n') };
}
