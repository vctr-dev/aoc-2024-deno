import { slidingWindows, sumOf, zip } from 'jsr:@std/collections';
import { BinaryHeap } from 'jsr:@std/data-structures';

enum D {
	U = '^',
	D = 'v',
	L = '<',
	R = '>',
}
type Node = { s: string | number; e: string | number; d: D };
/**
 * +---+---+---+
 * | 7 | 8 | 9 |
 * +---+---+---+
 * | 4 | 5 | 6 |
 * +---+---+---+
 * | 1 | 2 | 3 |
 * +---+---+---+
 *     | 0 | A |
 *     +---+---+
 */
const numPad = Map.groupBy(
	[
		{ s: 7, e: 8, d: D.R },
		{ s: 8, e: 9, d: D.R },
		{ s: 4, e: 5, d: D.R },
		{ s: 5, e: 6, d: D.R },
		{ s: 1, e: 2, d: D.R },
		{ s: 2, e: 3, d: D.R },
		{ s: 0, e: 'A', d: D.R },

		{ s: 7, e: 4, d: D.D },
		{ s: 8, e: 5, d: D.D },
		{ s: 4, e: 1, d: D.D },
		{ s: 5, e: 2, d: D.D },
		{ s: 9, e: 6, d: D.D },
		{ s: 6, e: 3, d: D.D },
		{ s: 2, e: 0, d: D.D },
		{ s: 3, e: 'A', d: D.D },
	].flatMap((v) => [v, { s: v.e, e: v.s, d: v.d === D.R ? D.L : D.U }]),
	(v) => v.s,
);

/**
 *     +---+---+
 *     | ^ | A |
 * +---+---+---+
 * | < | v | > |
 * +---+---+---+
 */
const dirPad = Map.groupBy(
	[
		{ s: '^', e: 'A', d: D.R },
		{ s: '<', e: 'v', d: D.R },
		{ s: 'v', e: '>', d: D.R },

		{ s: '^', e: 'v', d: D.D },
		{ s: 'A', e: '>', d: D.D },
	].flatMap((v) => [v, { s: v.e, e: v.s, d: v.d === D.R ? D.L : D.U }]),
	(v) => v.s,
);

// Numpad controlled by depressurised robot (depressurised robot's arm is stateful, start at A, let's call this numPadState/Input)
// Dirpad of depressurised robot controlled by radioactive robot (radioactive robot's arm is stateful, start at A, reset to A after instructing depressurised robot to input a digit/A, dState/Input)
// Dirpad of radioactive robot controlled by cold robot (cold robot's arm is stateful, start at A, rState/Input, resets on every dInput)
// Dirpad of cold robot controlled by human input (answer) (stateless, humanInput)
// input -> rState -> dState -> numPadState
//
// Question: Given numpad output, determine smallest number of human input required
//
// Observations:
// - *DirPadState resets on every number input. This means our slice boundary is from initial numPadState to next numPadState
// - All states reset after every row of number input.
export default async function (inputPath: string) {
	const input = await Deno.readTextFile(inputPath);
	const parsed = parseInput(input);
	const numDPads = 25;
	const moves = parsed
		.map((numPadInput) => {
			const numMoves = slidingWindows(['A', ...numPadInput], 2)
				.map(([initialNumPadState, nextNumPadState]) => {
					const potentialDInputs = search(
						initialNumPadState,
						nextNumPadState,
						numPad,
					).map((v) => [...v, 'A']);
					return smallestMoves(potentialDInputs, numDPads - 1);
				});
			return sumOf(numMoves, (v) => v);
		});
	const res = zip(parsed, moves);
	console.log(sumOf(res, (v) => parseInt(v[0].join('')) * v[1]));
}

const smallestMovesCache = new Map<string, ReturnType<typeof smallestMoves>>();
function smallestMoves(desiredOutput: Node['s'][][], depth: number): number {
	const movesLengths = desiredOutput.map((output) => {
		const cacheKey = output.join('') + depth;
		const cacheResult = smallestMovesCache.get(cacheKey);
		if (cacheResult) return cacheResult;

		const m = slidingWindows(['A', ...output], 2)
			.map(([initial, next]) => {
				return search(initial, next, dirPad).map((v) => [...v, 'A']);
			}).map((inputs) => {
				// Termination condition
				if (depth <= 0) {
					return inputs.map((v) => v.length)[0];
				}
				return smallestMoves(inputs, depth - 1);
			});
		const res = sumOf(m, (m) => m);

		smallestMovesCache.set(cacheKey, res);
		return res;
	});
	return Math.min(...movesLengths);
}

const searchCache = new Map<string, ReturnType<typeof search>>();
function search(
	start: Node['s'],
	end: Node['e'],
	graph: Map<Node['s'], Node[]>,
): D[][] {
	const cacheResult = searchCache.get(`${start},${end}`);
	if (cacheResult) return cacheResult;

	const heap = BinaryHeap
		.from([{ node: start, path: [] as D[] }], {
			compare: (a, b) => a.path.length - b.path.length,
		});
	const res: D[][] = [];
	while (heap.length) {
		const cur = heap.pop()!;
		// term
		if (cur.path.length && res[0] && cur.path.length > res[0]?.length) break;
		if (cur.node === end) {
			res.push(cur.path);
			continue;
		}

		// branch
		graph.get(cur.node)!.forEach((n) => {
			heap.push({ node: n.e, path: [...cur.path, n.d] });
		});
	}
	searchCache.set(`${start},${end}`, res);
	return res;
}

function parseInput(input: string) {
	return input
		.trim()
		.split('\n')
		.map((v) => v.split('').map((s) => isNaN(parseInt(s)) ? s : parseInt(s)));
}
