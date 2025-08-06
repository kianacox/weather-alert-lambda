const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["index.js"],
    bundle: true,
    platform: "node",
    target: "node18",
    format: "cjs",
    outfile: "dist/index.js",
    minify: true,
    sourcemap: false,
  })
  .catch(() => process.exit(1));
