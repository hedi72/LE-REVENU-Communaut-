import { readFile, writeFile, mkdir } from 'node:fs/promises';

const source = JSON.parse(await readFile('docs/design-reference/data.json', 'utf8'));
await mkdir('apps/web/src/styles', { recursive: true });
await writeFile(
  'apps/web/src/styles/maquette.css',
  `/* Styles de la maquette HTML fournie, conservés sans réinterprétation. */\n${await readFile('docs/design-reference/original.css', 'utf8')}`,
);
const attributes = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
};
const paths = Object.entries(source.icons).map(([name, markup]) => {
  for (const [from, to] of Object.entries(attributes)) markup = markup.replaceAll(from, to);
  return `  ${JSON.stringify(name)}: <>${markup}</>`;
});
await writeFile(
  'apps/web/src/components/icon.tsx',
  `import type { SVGProps } from 'react';\nconst paths = {\n${paths.join(',\n')}\n};\nexport type IconName = keyof typeof paths;\nexport function Icon({ name, className = '', ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {\n  return <svg className={\`icon \${className}\`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;\n}\n`,
);
delete source.icons;
delete source.state;
source.summary = { members: 4812, discussions: 1808, replies: 13700, resolved: 94 };
await mkdir('apps/api/src/bootstrap/fixtures', { recursive: true });
await writeFile('apps/api/src/bootstrap/fixtures/community.json', JSON.stringify(source, null, 2));
console.log('Styles, icônes et données de la maquette importés.');
