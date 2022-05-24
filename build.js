const path = require('path')
const rollup = require('rollup')
const { nodeResolve: resolve } = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const typescript = require('@rollup/plugin-typescript')
const json = require('@rollup/plugin-json')
const clear = require('rollup-plugin-clear')
const glob = require('glob')
const args = require('node-args')
const fs = require('fs')

const commonPlugins = [json(), resolve(), commonjs()]

const libBuild = async () => {
  const inputPlugins = [
    clear({ targets: ['public/js'] }),
    ...commonPlugins,
    typescript({ tsconfig: path.resolve(__dirname, './tsconfig.lib.json') }),
  ]
  const files = glob.sync(path.resolve(__dirname, './lib/*.[jt]s'))
  // console.log('lib files:', files)

  for (const input of files) {
    const inputOptions = {
      input,
      plugins: inputPlugins,
    }
    // create a bundle
    // see below for details on the options
    const bundle = await rollup.rollup(inputOptions)

    const filename = input.split('/').slice(-1)[0].split('.')[0]
    const outputOptions = [
      {
        file: path.resolve(__dirname, `./public/js/${filename}.iife.js`),
        name: filename[0].toUpperCase() + filename.slice(1),
        format: 'iife',
        sourcemap: 'inline',
      },
      {
        file: path.resolve(__dirname, `./public/js/${filename}.esm.js`),
        format: 'esm',
        sourcemap: 'inline',
      },
    ]

    for (const options of outputOptions) {
      // generate code and a sourcemap
      await bundle.generate(options)
      // or write the bundle to disk
      await bundle.write(options)
    }
  }
}

// const stage = {
//   main: async () => {
//     const inputOptions = {
//       input: path.resolve(__dirname, `./main.ts`),
//       plugins: [
//         ...commonPlugins,
//         typescript({
//           tsconfig: path.resolve(__dirname, './tsconfig.lib.json'),
//         }),
//       ],
//     }

//     const bundle = await rollup.rollup(inputOptions)

//     const outputOption = {
//       file: path.resolve(__dirname, `./dist/main.js`),
//       format: 'cjs',
//       sourcemap: 'inline',
//     }
//     // generate code and a sourcemap
//     await bundle.generate(outputOption)
//     // or write the bundle to disk
//     await bundle.write(outputOption)
//   },
// }

async function main() {
  const [pass] = args.additional

  if (pass == 'install') {
    // 判断是否需要安装

    if (!fs.existsSync(path.resolve(__dirname, `./dist`))) {
      fs.mkdirSync(path.resolve(__dirname, `./dist`))
    }

    if (!fs.existsSync(path.resolve(__dirname, `./dist/node_modules`))) {
      fs.symlinkSync(
        path.resolve(__dirname, `./node_modules`),
        path.resolve(__dirname, `./dist/node_modules`)
      )
    }

    if (!fs.existsSync(path.resolve(__dirname, `./dist/public`))) {
      fs.symlinkSync(
        path.resolve(__dirname, `./public`),
        path.resolve(__dirname, `./dist/public`)
      )
    }
  } else {
    await libBuild()
  }
}

main()
