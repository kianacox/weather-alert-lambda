const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["index.ts"],
    bundle: true,
    platform: "node",
    target: "node18",
    format: "cjs",
    outfile: "dist/index.js",
    minify: true,
    sourcemap: false,
    loader: { ".ts": "ts" },
  })
  .catch(() => process.exit(1));
