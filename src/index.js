/**
 *
 * OARepo vue.js default components to be used in vuejs based client for invenio repository
 *
 */
import TaxonomyEditor from './components/TaxonomyEditor.vue'
import DialogTaxonomyInput from './components/DialogTaxonomyInput.vue'

const VueTaxonomy = {
    install (Vue) {
        Vue.component('taxonomy-editor', TaxonomyEditor)
        Vue.component('dialog-taxonomy-input', DialogTaxonomyInput)
    }
}

export {
    VueTaxonomy,
    TaxonomyEditor,
    DialogTaxonomyInput
}
