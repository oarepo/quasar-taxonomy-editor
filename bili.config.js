const glob = require('glob')

const input = glob('./*/*.vue', { sync: true }).filter(
    (path) => {
        const COMPONENT_PATH = /\.\/(\w*)\/(\w*)\.vue$/
        const [any, folder, file] = COMPONENT_PATH.exec(path) || []
        return (any && folder === file)
    }
)

module.exports = {
    input,
    banner: true,
    filename: 'src/index.js',
    runtimeHelpers: true,
    formats: ['es'],
    plugins: {
        babel: {
            runtimeHelpers: true
        }
    },
    extendRollupConfig: (config) => {
        // console.log(JSON.stringify(config))
        config.inputConfig.plugins.forEach(x => {
            if (x.name === 'babel') {
                x.runtimeHelpers = true
                x.exclude = 'node_modules/**'
            }
        })
        //
        return config
    }
}
