import { Vue, Component, Watch } from 'vue-property-decorator'
import LiquorTree from 'liquor-tree'

@Component({
    components: {
        'tree': LiquorTree
    },
    props: {
        'taxonomyUrl': String,
        'taxonomyCode': String,
        'filterMatcher': Function
    }
})
class TaxonomyMixin extends Vue {
    filter = ''
    filterOptions = {
        emptyText: 'Nothing found!',
        matcher: (query, node) => {
            if (this.filterMatcher) {
                return this.filterMatcher({ taxonomyCode: this.taxonomyCode, query, term: node.data })
            }
            const val = JSON.stringify(node.data)
            console.log('filter', query, val)
            return new RegExp(query, 'i').test(val)
        },
        plainList: false,
        showChildren: true
    }
    data = []
    dataReady = false
    localTaxonomyUrl = null
    parentTaxonomyUrl = null
    subtree = null

    mounted () {
        this.onTaxonomyUrl()
    }

    processData (data) {
        return data.map(x => {
            if (x.children !== undefined) {
                x.children = this.processData(x.children)
            }
            x.data = { ...x }
            if (x.data.selectable !== undefined) {
                x.state = { selectable: x.data.selectable }
            }
            delete x.data.children
            return x
        })
    }

    @Watch('taxonomyUrl')
    onTaxonomyUrl () {
        console.log('taxonomy url', this.taxonomyUrl)
        if (this.taxonomyUrl !== undefined) {
            this.localTaxonomyUrl = this.taxonomyUrl
            this.loadTaxonomy().then(() => {})
        }
    }

    loadTaxonomy () {
        return new Promise((resolve, reject) => {
            this.dataReady = false
            console.log('loading taxonomy', this.localTaxonomyUrl)
            if (this.localTaxonomyUrl !== null) {
                this.$axios.get(this.localTaxonomyUrl, {
                    headers: {
                        'Accept': 'application/json; drilldown=true'
                    }
                }).then(data => {
                    if (Array.isArray(data.data)) {
                        this.data = this.processData(data.data)
                        this.parentTaxonomyUrl = null
                        this.subtree = null
                    } else {
                        this.parentTaxonomyUrl = data.data.links.parent_tree || null
                        this.data = this.processData(data.data.children)
                        this.subtree = data.data
                    }
                    this.$nextTick(() => {
                        this.dataReady = true
                    })
                    resolve()
                }).catch(() => {
                    resolve()
                })
            } else {
                this.data = []
                resolve()
            }
        })
    }

    openTaxonomy (node) {
        this.localTaxonomyUrl = node.data.links.tree
        this.loadTaxonomy().then(() => {})
    }

    taxonomyUp () {
        this.localTaxonomyUrl = this.parentTaxonomyUrl
        this.loadTaxonomy().then(() => {})
    }
}

export { TaxonomyMixin }
