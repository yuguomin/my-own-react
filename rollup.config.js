import typescript from "rollup-plugin-typescript";
import sourceMaps from "rollup-plugin-sourcemaps";

export default {
  input: "./src/fishtail@15/index.ts",
  plugins: [
    typescript({
      exclude: "node_modules/**",
      typescript: require("typescript")
    }),
    sourceMaps()
  ],
  output: [
    {
      format: "cjs",
      file: "dist/fishtail@15/bundle.cjs.js",
      sourcemap: true
    },
    {
      format: "es",
      file: "dist/fishtail@15/bundle.esm.js",
      sourcemap: true
    }
  ]
};