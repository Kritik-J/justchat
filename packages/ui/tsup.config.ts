import { defineConfig, Options } from "tsup";

export const options: Options = {
  entry: ["./src"],
  format: ["cjs", "esm"],
  minify: true,
  dts: true,
  bundle: true,
};

export default defineConfig(options);
