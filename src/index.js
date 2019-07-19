/**
 *
 * OARepo vue.js default components to be used in vuejs based client for invenio repository
 *
 */
import TaxonomyEditor from './components/TaxonomyEditor'

const VueTaxonomy = {
    install (Vue) {
        Vue.component('taxonomy-editor', TaxonomyEditor)
    }
}

export {
    VueTaxonomy,
    TaxonomyEditor
}
