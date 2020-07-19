import DefaultTermViewComponent from 'app/library/components/default/DefaultTermViewComponent'
import DefaultTaxonomyViewComponent from 'app/library/components/default/DefaultTaxonomyViewComponent'

export class TaxonomyComponentFactory {
    getComponent ({ taxonomy, term }) {
        if (term) {
            return DefaultTermViewComponent
        } else {
            return DefaultTaxonomyViewComponent
        }
    }
}
