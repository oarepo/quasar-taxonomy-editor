/**
 *
 * OARepo vue.js default components to be used in vuejs based client for invenio repository
 *
 */
import TaxonomyEditor from './components/TaxonomyEditor.vue'
import axios from 'axios'
import { TaxonomyComponentFactory } from './types'
import DefaultTermViewComponent from 'app/library/components/DefaultTermViewComponent'
import DefaultTaxonomyViewComponent from 'app/library/components/DefaultTaxonomyViewComponent'
import DefaultEditDialogComponent from 'app/library/components/DefaultEditDialogComponent'
import TermComponent from 'app/library/components/TermComponent'
import TermSelect from 'app/library/components/TermSelect'

class Taxonomies {
    constructor (options) {
        this.termViewers = options.termViewers || {}
        this.termEditors = options.termEditors || {}
        this.taxonomyViewers = options.taxonomyViewers || {}
        this.taxonomyEditors = options.taxonomyEditors || {}
        this.defaultTermViewer = options.defaultTermViewer || null
        this.defaultTermEditor = options.defaultTermEditor || null
        this.defaultTaxonomyViewer = options.defaultTaxonomyViewer || null
        this.defaultTaxonomyEditor = options.defaultTaxonomyEditor || null
        this.taxonomiesUrl = options.taxonomiesUrl || '/api/2.0/taxonomies/'
        this.taxonomyPermissions = options.taxonomyPermissions || function (taxonomy) {
            return [
                'edit'
            ]
        }
        this.termPermissions = options.termPermissions || function (taxonomy, term) {
            return [
                'edit',
                'delete',
                'insert'
            ]
        }
        this.titleGetter = options.taxonomyTitleGetter || function (taxonomy) {
            if (taxonomy.title) {
                return taxonomy.title
            }
            return taxonomy.code
        }
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

    async loadTaxonomies () {
        return (await axios.get(`${this.taxonomiesUrl}?representation:include=dcn`)).data.reduce((dict, x) => {
            dict[x.code] = x
            return dict
        }, {})
    }

    async loadTaxonomy (code) {
        return (await axios.get(this.taxonomyUrl(code))).data
    }

    taxonomyUrl (code) {
        return `${this.taxonomiesUrl}${code}`
    }

    async loadTaxonomyPage ({ code, page, size, url, filter, levels }) {
        if (!url) {
            url = `${this.taxonomiesUrl}${code}?page=${page}&size=${size}&representation:include=dsc,anh,slug,dcn,drl,lvl`
        } else {
            url = `${url}?page=${page}&size=${size}&representation:include=dsc,anh,slug,dcn,drl,lvl`
        }
        if (levels) {
            url = `${url}&representation:levels=${levels}`
        }
        if (filter) {
            url = `${url}&q=${encodeURIComponent(filter)}`
        }
        const ret = await axios.get(url)
        return {
            terms: ret.data,
            total: ret.headers['x-total']
        }
    }

    async suggest ({ code, filter, size }) {
        const url = `${this.taxonomiesUrl}${code}?page=1&size=${size || 20}&representation:include=dsc,anc,slug,dcn,drl,lvl&q=${encodeURIComponent(filter)}`
        const ret = await axios.get(url)
        return ret.data.children || []
    }

    async addChild ({ term = undefined, url = undefined, child }) {
        if (!url) {
            url = `${term.links.self}?representation:include=dsc,slug,dcn,drl,lvl`
        } else {
            if (url.indexOf('?') >= 0) {
                url += '&'
            } else {
                url += '?'
            }
            url += 'representation:include=dsc,slug,dcn,drl,lvl'
        }
        const ret = await axios.post(url, child, {
            headers: {
                'If-None-Match': '*'
            },
            validateStatus: function (status) {
                return status >= 200 && status < 300
            }
        })
        return ret.data
    }

    addViewer (code, viewer) {
        this.termViewers[code] = viewer
    }

    addEditor (code, editor) {
        this.termEditors[code] = editor
    }

    addTaxonomyViewer (code, viewer) {
        this.taxonomyViewers[code] = viewer
    }

    addTaxonomyEditor (code, editor) {
        this.taxonomyEditors[code] = editor
    }

    _getComponent ({ taxonomy, term, parent, usage }, components, defaultComponent) {
        const component = components[taxonomy] || defaultComponent
        if (component instanceof TaxonomyComponentFactory) {
            return component.getComponent({ taxonomy, term, parent, usage })
        }
        return component
    }

    getTermViewComponent ({ taxonomy, term, parent, usage }) {
        return this._getComponent({
            taxonomy,
            term,
            parent,
            usage
        }, this.termViewers, this.defaultTermViewer || DefaultTermViewComponent)
    }

    getTaxonomyViewComponent ({ taxonomy, term, parent, usage }) {
        return this._getComponent({
            taxonomy,
            term,
            parent,
            usage
        }, this.taxonomyViewers, this.defaultTaxonomyViewer, DefaultTaxonomyViewComponent)
    }

    getTermEditComponent ({ taxonomy, term, parent, usage }) {
        return this._getComponent({
            taxonomy,
            term,
            parent,
            usage
        }, this.termEditors, this.defaultTermEditor || DefaultEditDialogComponent)
    }

    getTaxonomyEditComponent ({ taxonomy, term, parent, usage }) {
        return this._getComponent({
            taxonomy,
            term,
            parent,
            usage
        }, this.taxonomyEditors, this.defaultTaxonomyEditor || DefaultEditDialogComponent)
    }
}

const VueTaxonomy = {
    install (Vue, options = {}) {
        Vue.component('taxonomy-editor', TaxonomyEditor)
        Vue.component('taxonomy-term', TermComponent)
        Vue.component('term-select', TermSelect)
        Vue.prototype.$taxonomies = new Taxonomies(options)
    }
}

export {
    VueTaxonomy,
    TaxonomyEditor,
    TaxonomyComponentFactory
}
