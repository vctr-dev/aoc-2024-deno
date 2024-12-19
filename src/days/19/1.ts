export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	const resources = parsed.resources;
	const res = parsed.patterns.filter((p) => search(resources, p)).length;
	console.log(res);
}

function search(resources: string[], p: string) {
	const stack = [p];
	while (stack.length) {
		const s = stack.pop()!;
		// term
		if (s.length <= 0) {
			return true;
		}
		resources.filter((r) => s.startsWith(r)).forEach((r) => {
			stack.push(s.slice(r.length));
		});
	}
	return false;
}

function parseInput(input: string) {
	const [resources, patterns] = input
		.trim().split('\n\n');
	return { resources: resources.split(', '), patterns: patterns.split('\n') };
}
