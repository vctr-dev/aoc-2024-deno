const [dayFile, datasource] = Deno.args;

const [dayOnly, ...parts] = dayFile.split('-');
const importPath = `${import.meta.dirname}/src/days/${dayOnly}`;
const programFile = `${importPath}/${parts.length ? parts.join('-') : 1}.ts`;
const datasourceFile = `${importPath}/${datasource}`;
// console.table({ programFile, datasourceFile });

const { default: program } = await import(programFile);
console.time('Program runtime');
await program(datasourceFile);
console.timeEnd('Program runtime');
