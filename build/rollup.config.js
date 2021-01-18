// rollup.config.js
import path from 'path'
import vue from 'rollup-plugin-vue'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import babel from 'rollup-plugin-babel'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))

const projectRoot = path.resolve(__dirname, '..')

const baseConfig = {
    input: 'library/index.js',
    plugins: {
        preVue: [
            alias({
                resolve: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
                entries: {
                    '@': path.resolve(projectRoot, 'library')
                }
            })
        ],
        replace: {
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env.ES_BUILD': JSON.stringify('false')
        },
        vue: {
            css: false
        },
        babel: {
            exclude: 'node_modules/**',
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
            runtimeHelpers: true
        }
    }
}

// ESM/UMD/IIFE shared settings: externals
// Refer to https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
const external = [
    // list external dependencies, exactly the way it is written in the import statement.
    // eg. 'jquery'
    'vue'
]

// Customize configs for individual targets
const buildFormats = []
if (!argv.format || argv.format === 'es') {
    const esConfig = {
        ...baseConfig,
        external,
        output: {
            file: 'dist/quasar-taxonomy-editor.esm.js',
            format: 'esm',
            exports: 'named'
        },
        plugins: [
            replace({
                ...baseConfig.plugins.replace,
                'process.env.ES_BUILD': JSON.stringify('true')
            }),
            ...baseConfig.plugins.preVue,
            vue(baseConfig.plugins.vue),
            babel({
                ...baseConfig.plugins.babel,
                presets: [
                    [
                        '@babel/preset-env'
                    ]
                ],
                plugins: [
                    'syntax-dynamic-import',
                    [
                        '@babel/plugin-proposal-decorators',
                        {
                            'legacy': true
                        }
                    ],
                    [
                        '@babel/plugin-proposal-class-properties',
                        {
                            'loose': true
                        }
                    ]
                ]
            }),
            commonjs()
        ]
    }
    buildFormats.push(esConfig)
}
// Export config
export default buildFormats
