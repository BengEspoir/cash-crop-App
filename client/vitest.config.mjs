import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { transformWithOxc } from "vite";
import { defineConfig } from "vitest/config";

const srcDirectory = fileURLToPath(new URL("./src", import.meta.url));
const normalizedSrcDirectory = srcDirectory.replaceAll("\\", "/");

const nextJsRouteTransform = {
  name: "agriculnet-next-jsx-in-js",
  enforce: "pre",
  async transform(code, id) {
    const filePath = id.split("?", 1)[0].replaceAll("\\", "/");
    const isSourceJavaScript = filePath.startsWith(normalizedSrcDirectory)
      && filePath.endsWith(".js");

    if (!isSourceJavaScript) return null;

    return transformWithOxc(code, filePath, {
      lang: "jsx",
      jsx: {
        runtime: "automatic",
        importSource: "react",
      },
      sourcemap: true,
    });
  },
};

export default defineConfig({
  plugins: [nextJsRouteTransform, react()],
  resolve: {
    alias: {
      "@": srcDirectory,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    pool: "threads",
    maxWorkers: 1,
    fileParallelism: false,
    restoreMocks: true,
    clearMocks: true,
  },
});
