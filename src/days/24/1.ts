export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	console.log(parsed);
	// Part 1
	// Part 2
}

function parseInput(input: string) {
	return input
		.trim();
}
