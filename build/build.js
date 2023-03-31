const { build } = require("esbuild");

build({
  entryPoints: ["./src/extension.ts"],
  bundle: true,
  outdir: "out",
  external: ["vscode"],
  format: "cjs",
  platform: "node",
  sourcemap: true,
});
