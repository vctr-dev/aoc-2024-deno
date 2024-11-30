const [day, datasource] = Deno.args;

const importPath = `${import.meta.dirname}/src/days/day${day}`;
const programFile = `${importPath}/main.ts`;
const datasourceFile = `${importPath}/${datasource}`;
console.table({ programFile, datasourceFile });

const { default: program } = await import(programFile);
program(datasourceFile);
