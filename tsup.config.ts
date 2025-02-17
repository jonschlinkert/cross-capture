import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['index.ts', 'src/*.ts'],
  cjsInterop: true,
  format: ['cjs', 'esm'],
  keepNames: true,
  minify: false,
  shims: true,
  splitting: false,
  sourcemap: true,
  target: 'node18'
});
