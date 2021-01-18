const fs = require('fs')

const p = JSON.parse(fs.readFileSync('package.json'))

p.peerDependencies = p.dependencies

delete p.devDependencies
delete p.browserslist
delete p.engines
delete p.scripts
delete p.dependencies
p.main = 'quasar-taxonomy-editor.esm.js'

fs.writeFileSync('dist/package.json', JSON.stringify(p, null, 4))
