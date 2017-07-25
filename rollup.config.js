import closure from 'rollup-plugin-closure-compiler-js'
import filesize from 'rollup-plugin-filesize'



const plugins = []

if (process.env.production) {
  plugins.push(
    closure({
      languageIn: 'ECMASCRIPT6',
      languageOut: 'ECMASCRIPT5',
      compilationLevel: 'SIMPLE',
      warningLevel: 'DEFAULT',
    }),
    filesize()
  )
}

export default {
  entry: 'src/index.js',
  dest: 'dist/index.js',
  format: 'umd',
  treeshake: false,
  moduleName: 'woerd',
  plugins,
  sourceMap: true
}
