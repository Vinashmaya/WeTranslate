import * as esbuild from 'esbuild';
import fs from 'node:fs';

const API_KEY = process.env.API_KEY || "YOUR_API_KEY_HERE";

console.log("Building CRM Polyglot Widget...");

await esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'dist/widget.js',
  format: 'iife', // Immediately Invoked Function Expression for direct browser injection
  target: ['es2020'],
  minify: true, // Minify for smaller payload
  sourcemap: false,
  define: {
    'process.env.API_KEY': JSON.stringify(API_KEY),
    'process.env.NODE_ENV': '"production"'
  },
  loader: {
    '.png': 'dataurl', // Inline small images if any
    '.svg': 'text'
  },
});

console.log("Build complete! Output: dist/widget.js");