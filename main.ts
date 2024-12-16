const [day, datasource] = Deno.args;

const importPath = `${import.meta.dirname}/src/days/day${day}`;
const programFile = `${importPath}/main.ts`;
const datasourceFile = `${importPath}/${datasource}`;
// console.table({ programFile, datasourceFile });

const { default: program } = await import(programFile);
const start = performance.now();
await program(datasourceFile);
const end = performance.now();
console.log("Finished in", (end - start).toFixed(3), "ms");
