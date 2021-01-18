import DefaultTermViewComponent from './components/default/DefaultTermViewComponent.vue'
import DefaultTaxonomyViewComponent from './components/default/DefaultTaxonomyViewComponent.vue'

export class TaxonomyComponentFactory {
    getComponent ({ taxonomy, term }) {
        if (term) {
            return DefaultTermViewComponent
        } else {
            return DefaultTaxonomyViewComponent
        }
    }
}
