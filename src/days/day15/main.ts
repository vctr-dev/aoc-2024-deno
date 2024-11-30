import fs from "node:fs/promises";

export default async function (inputPath: string) {
  const input = await fs.readFile(inputPath, { encoding: "utf-8" });
  console.log(input);
}
