import { readFile, writeFile, rm, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source=await readFile(path.join(root,'app/page.tsx'),'utf8');
// All interactions on this landing page are native links. Render the same
// component into static HTML so GitHub Pages needs no application server.
const adapted=source.replace("import Image from 'next/image';",`import React from 'react';
function Image({unoptimized,priority,...props}) { return React.createElement('img', props); }`);
const compiled=ts.transpileModule(adapted,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const temp=path.join(root,'app/.pages-render.mjs');
await writeFile(temp,compiled);
let markup;
try { const {default:Home}=await import(temp); markup=renderToStaticMarkup(React.createElement(Home)); }
finally { await rm(temp,{force:true}); }
markup=markup.replace(/(src|href)="\/(?!\/)([^"]*)"/g,'$1="./public/$2"');
const css=(await readFile(path.join(root,'app/globals.css'),'utf8'))
 .replace(/@import\s+[^;]+;/g,'').replace(/@theme\s+inline\s*\{[^}]*\}/g,'')
 .replace(/url\(['"]?\/fonts\//g,"url('./public/fonts/");
const html='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PEE | Planejamento Estratégico Evolucionário — ABO Academy</title><meta name="description" content="Construa a estratégia da sua organização enquanto desenvolve líderes capazes de concebê-la, assumi-la e prepará-la para a execução."><link rel="stylesheet" href="./styles.css"></head><body>'+markup+'</body></html>';
for(const m of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)) { if(m[1]!=='styles.css') await access(path.join(root,m[1])); }
await writeFile(path.join(root,'index.html'),html);
await writeFile(path.join(root,'styles.css'),css);
await writeFile(path.join(root,'.nojekyll'),'');
console.log('GitHub Pages: HTML, CSS and all asset references verified.');
