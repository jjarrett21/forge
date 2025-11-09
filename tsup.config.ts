import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["packages/cli/src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  bundle: true,
  external: [
    "@clack/prompts",
    "@anthropic-ai/sdk",
    "execa",
    "fs-extra",
    "zod",
    "ora",
    "prompts",
  ],
  shims: true,
});
