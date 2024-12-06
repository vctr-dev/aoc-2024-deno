import { sum } from "../../utils.ts";
export default async function (inputPath: string) {
  const input = await Deno.readTextFile(inputPath);
  const parsed = parseInput(input);

  const gameState = new GameState(parsed);
  const newObstacleDict = new PosDict();
  const { visited } = runGame(
    gameState,
    (guardPos, guardDir) => {
      // get the next position
      const newPos = guardPos.move(guardDir);
      // if it is already an obstacle, do nothing
      if (
        newPos.isEqual(gameState.guardStart) ||
        gameState.obstacleLookup.has(newPos) ||
        newObstacleDict.has(newPos)
      ) {
        return;
      }
      // try adding an obstacle and running the game
      const newGameState = new GameState(parsed);
      newGameState.obstacleLookup.add(newPos);
      const { reason } = runGame(newGameState);
      if (reason === EndGameReason.Loop) {
        newObstacleDict.add(newPos);
      }
    },
  );
  console.log("Part 1: " + visited.size());
  console.log("Part 2: " + newObstacleDict.size());
}

function parseInput(input: string) {
  return input
    .trim().split("\n").map((v) => v.split(""));
}

function runGame(
  gameState: GameState,
  cb?: (guardPos: Pos, guardDir: Move) => unknown,
) {
  let max = 1_000_000;
  while (!gameState.endGameReason && max-- > 0) {
    gameState.tick((guardPos, guardDir) => {
      cb?.(guardPos, guardDir);
    });
  }
  if (max <= 0) {
    throw new Error("Too many loops");
  }
  return { visited: gameState.guardHistory, reason: gameState.endGameReason };
}
enum EndGameReason {
  OutOfBound = "out",
  Loop = "loop",
}

class GameState {
  guardStart: Pos;
  guardPos: Pos;
  currentGuardDir = Move.Up;
  obstacleLookup: PosDict;
  guardHistory: PosDict;
  endGameReason?: EndGameReason;
  map: string[][];

  constructor(initialMap: string[][]) {
    this.map = initialMap.map((r) => [...r]);
    let x = 0, y = 0;
    this.obstacleLookup = new PosDict();
    y = initialMap.findIndex((r) => {
      x = r.findIndex((v) => v === "^");
      return (x >= 0);
    });
    this.guardPos = new Pos(x, y);
    this.guardStart = new Pos(x, y);

    initialMap.forEach((r, y) =>
      r.forEach((v, x) => {
        if (v === "#") this.obstacleLookup.add(new Pos(x, y));
        if (v === "^") this.guardPos = new Pos(x, y);
      })
    );

    this.guardHistory = new PosDict();
    this.guardHistory.add(this.guardPos, this.currentGuardDir);
  }

  tick(cb?: (guardPos: Pos, guardDir: Move) => unknown) {
    if (this.endGameReason) return;
    // Guard tries to take a step forward
    const newPos = this.guardPos.move(this.currentGuardDir);
    if (this.obstacleLookup.has(newPos)) {
      this.currentGuardDir = turnRight(this.currentGuardDir);
      cb?.(this.guardPos, this.currentGuardDir);
    } else {
      this.guardPos = newPos;
      this.endGameReason = this.getEndGameReason();
      if (!this.endGameReason) {
        this.guardHistory.add(this.guardPos, this.currentGuardDir);
        cb?.(this.guardPos, this.currentGuardDir);
      }
    }
  }

  getEndGameReason() {
    if (isOutOfBound(this.map, this.guardPos)) {
      return EndGameReason.OutOfBound;
    }
    if (this.guardHistory.has(this.guardPos, this.currentGuardDir)) {
      return EndGameReason.Loop;
    }
  }
}
function isOutOfBound(map: string[][], pos: Pos) {
  return !map[pos.y]?.[pos.x];
}

function turnRight(dir: Move) {
  switch (dir) {
    case Move.Up:
      return Move.Right;
    case Move.Right:
      return Move.Down;
    case Move.Down:
      return Move.Left;
    case Move.Left:
      return Move.Up;
    default:
      return Move.None;
  }
}

class PosDict {
  lookup: Map<number, Map<number, Set<Move>>> = new Map();

  add(pos: Pos, dir = Move.None) {
    this.lookup.get(pos.x)?.get(pos.y)?.add(dir) ||
      this.lookup.get(pos.x)?.set(pos.y, new Set([dir])) ||
      this.lookup.set(pos.x, new Map([[pos.y, new Set([dir])]]));
  }

  has(pos: Pos, dir = Move.None) {
    return this.lookup.get(pos.x)?.get(pos.y)?.has(dir);
  }

  size() {
    return sum([...this.lookup.values().map((v) => v.size)]);
  }
}

enum Move {
  Up = "up",
  Down = "down",
  Left = "left",
  Right = "right",
  None = "none",
}
class Pos {
  constructor(public x: number, public y: number) {
  }
  isEqual(pos: Pos) {
    return this.x === pos.x && this.y === pos.y;
  }

  move(dir: Move) {
    switch (dir) {
      case Move.Up:
        return new Pos(this.x, this.y - 1);
      case Move.Down:
        return new Pos(this.x, this.y + 1);
      case Move.Left:
        return new Pos(this.x - 1, this.y);
      case Move.Right:
        return new Pos(this.x + 1, this.y);
    }
    return this;
  }
}
