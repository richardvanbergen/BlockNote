import * as path from "path";
import { webpackStats } from "rollup-plugin-webpack-stats";
import { defineConfig } from "vite";
import pkg from "./package.json";
// import eslintPlugin from "vite-plugin-eslint";

const deps = Object.keys({
  ...pkg.dependencies,
  ...pkg.peerDependencies,
  ...pkg.devDependencies,
});

// https://vitejs.dev/config/
export default defineConfig((conf) => ({
  test: {
    setupFiles: ["./vitestSetup.ts"],
  },
  plugins: [webpackStats() as any],
  // used so that vitest resolves the core package from the sources instead of the built version
  resolve: {
    alias:
      conf.command === "build"
        ? ({} as Record<string, string>)
        : ({
            // load live from sources with live reload working
            "@blocknote/core": path.resolve(__dirname, "../core/src/"),
            "@blocknote/react": path.resolve(__dirname, "../react/src/"),
          } as Record<string, string>),
  },
  build: {
    sourcemap: true,
    lib: {
      entry: {
        "blocknote-code-block": path.resolve(__dirname, "src/index.ts"),
      },
      name: "blocknote-code-block",
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        format === "es" ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: (source: string) => {
        if (deps.includes(source)) {
          return true;
        }

        if (source.startsWith("@shikijs/")) {
          return true;
        }

        return false;
      },
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
        interop: "compat", // https://rollupjs.org/migration/#changed-defaults
      },
    },
  },
}));
