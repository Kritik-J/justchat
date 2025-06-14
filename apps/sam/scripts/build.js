import { build } from "esbuild";

const buildOptions = {
  entryPoints: ["src/functions/**/*.js"],
  bundle: true,
  minify: true,
  sourcemap: "inline",
  outdir: "dist",
  outbase: "src",
  platform: "node",
  target: "node20",
  external: ["aws-sdk/*"],
};

async function runBuild() {
  try {
    await build(buildOptions);
    console.log("Build completed successfully");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

runBuild();
