import closure from 'rollup-plugin-closure-compiler-js'
import filesize from 'rollup-plugin-filesize'
import babel from 'rollup-plugin-babel'

const plugins = [
  babel({
    exclude: 'node_modules/**',
    presets: [['env', {modules: false}]],
    plugins: ["external-helpers"]
  }),
  closure({ compilationLevel: 'SIMPLE' }),
  filesize()
]

export default {
  entry: 'src/index.js',
  dest: 'dist/index.js',
  format: 'umd',
  treeshake: false,
  moduleName: 'woerd',
  plugins,
  sourceMap: true
}
