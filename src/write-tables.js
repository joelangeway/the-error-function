
const { erf, invErf } = require('./erf');
const { niceNumber, cmp } = require('./utils');

function computeErfTableSamples() {
  /**
   * What are the significant `x` and `y` coordinates are which we'd like to
   * include a sample?
   */
  let xs = [], ys = [];
  for (i = 0; i < 61; i++) {
    xs.push(i / 10);
  }
  for (let i = 0; i < 15; i++) {
    const b = '0.9999999999999999999'.substring(0, i + 2);
    for (let j = 0; j <= 9; j++) {
      ys.push(+`${b}${j}`);
    }
  }
  // We sort and deduplicate the y's so we can generate the values more simply.
  ys = ys.sort((a, b) => a - b).filter(
    (y, i, a) => y < 1 && (i === 0 || y > a[i - 1])
  );

  return xs.map(x => ({ x, y: erf(x) })).concat(
    ys.map(y => ({ x: invErf(y), y }))
  ).sort((a, b) => cmp(a.x, b.x)).filter(
    ({ y }, i, a) => y < 1 && (i == 0 || y > a[i - 1].y)
  );
}

function formatErfTable() {
  const samples = computeErfTableSamples();
  const xColumn = ['x', '-------------------'].concat(
    samples.map(({ x }) => niceNumber(x)));
  const yColumn = ['erf(x)', '-------------------'].concat(
    samples.map(({ y }) => niceNumber(y)));
  const xWidth = xColumn.map(s => s.length).reduce((a, b) => Math.max(a, b), 0);
  const yWidth = yColumn.map(s => s.length).reduce((a, b) => Math.max(a, b), 0);

  return Array.from(
    { length: xColumn.length },
    (_, k) => `| ${xColumn[k].padEnd(xWidth, ' ')} | ${yColumn[k].padEnd(yWidth)} |\n`
  ).join('');
}

async function writeTables() {
  const samples = computeErfTableSamples();
  const fs = require('fs/promises');
  fs.path = require('path');
  const baseTarget = fs.path.resolve(__dirname, '../output/erf');

  const json = `[\n  ${samples.map(
    ({ x, y }) => `{ "x": ${niceNumber(x)}, "y": ${niceNumber(y)}}`
  ).join(',\n  ')
    }\n]\n`;
  fs.writeFile(`${baseTarget}.json`, json);
  const tableMarkdown = formatErfTable();
  fs.writeFile(`${baseTarget}.md`, tableMarkdown);
}

async function main() {
  await writeTables();
}

main();
