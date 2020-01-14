/**
 *
 * OARepo vue.js default components to be used in vuejs based client for invenio repository
 *
 */
import TaxonomyEditor from './components/TaxonomyEditor.vue'
import DialogTaxonomyInput from './components/DialogTaxonomyInput.vue'
import axios from 'axios'

class Taxonomies {
    constructor () {
        this.taxonomies = {}
        this.viewers = {}
        this.editors = {}
        this.defaultViewer = null
    }

    addTaxonomy (code, title, url) {
        this.taxonomies[code] = {
            code,
            title,
            links: {
                self: url,
                tree: url + '?drilldown=True'
            }
        }
    }

    async loadTaxonomies (url) {
        this.taxonomies = {
            ...this.taxonomies
        }
        await axios.get(url)
            .then((resp) => {
                resp.data.forEach(x => {
                    this.taxonomies[x.code] = x
                })
            })
            .catch((err) => {
                console.log(err)
            })
        return this.taxonomies
    }

    addViewer (code, viewer) {
        this.viewers[code] = viewer
    }

    addEditor (code, editor) {
        this.editors[code] = editor
    }
}

const VueTaxonomy = {
    install (Vue) {
        Vue.component('taxonomy-editor', TaxonomyEditor)
        Vue.component('dialog-taxonomy-input', DialogTaxonomyInput)
        Vue.prototype.$taxonomies = new Taxonomies()
    }
}

export {
    VueTaxonomy,
    TaxonomyEditor,
    DialogTaxonomyInput
}
