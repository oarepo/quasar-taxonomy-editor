import { VueTaxonomy, TaxonomyComponentFactory } from '@oarepo/quasar-taxonomy-editor'
import CountryTermViewComponent from 'components/CountryTermViewComponent'
import CountryTermInplaceViewComponent from 'components/CountryTermInplaceViewComponent'
import CountryEditComponent from 'components/CountryEditComponent'
import ContinentEditComponent from 'components/ContinentEditComponent'

class CountryEditorFactory extends TaxonomyComponentFactory {
    getComponent ({ term, parent }) {
        if (!term) {
            if (parent) {
                return CountryEditComponent
            } else {
                return ContinentEditComponent
            }
        }
        if (term.CountryName) {
            return CountryEditComponent
        } else {
            return ContinentEditComponent
        }
    }
}

class CountryViewFactory extends TaxonomyComponentFactory {
    getComponent ({ term, parent, usage }) {
        if (usage === 'inplace') {
            return CountryTermInplaceViewComponent
        }
        return CountryTermViewComponent
    }
}

export default async ({ Vue }) => {
    VueTaxonomy.install(Vue, {
        termViewers: {
            country: new CountryViewFactory()
        },
        termEditors: {
            country: new CountryEditorFactory()
        },
        termPermissions: (taxonomy, term) => {
            if (!term) {
                return [
                    'insert'
                ]
            }
            const ret = ['edit']
            if (term.level > 1) {
                ret.push('delete')
                ret.push('move')
            } else {
                ret.push('insert')
            }
            return ret
        }
    })
}
