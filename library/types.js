import DefaultTermViewComponent from 'app/library/components/DefaultTermViewComponent'
import DefaultTaxonomyViewComponent from 'app/library/components/DefaultTaxonomyViewComponent'

export class TaxonomyComponentFactory {
    getComponent ({ taxonomy, term }) {
        if (term) {
            return DefaultTermViewComponent
        } else {
            return DefaultTaxonomyViewComponent
        }
    }
}
