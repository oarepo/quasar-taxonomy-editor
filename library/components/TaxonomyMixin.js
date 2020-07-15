import { Vue, Component, Watch } from 'vue-property-decorator'
import LiquorTree from 'liquor-tree'

@Component({
    components: {
        tree: LiquorTree
    },
    props: {
        taxonomyCode: String,
        filterMatcher: Function,
        startExpanded: Boolean
    }
})
class TaxonomyMixin extends Vue {
    filter = ''
    activatedFilter = ''

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
    taxonomyUrlStack = []
    taxonomyTermStack = []
    pageStack = []
    page = 1
    size = 50
    total = 0

    mounted () {
        this.loadTaxonomy()
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

    loadTaxonomy () {
        this.$taxonomies.loadTaxonomyPage({
            code: this.taxonomyCode,
            page: this.page,
            size: this.size,
            url: this.localTaxonomyUrl,
            filter: this.activatedFilter
        }).then(({ terms, total }) => {
            // terms starts with taxonomy node
            this.data = this.processData(terms.children)
            this.total = total
            this.dataReady = false
            this.$nextTick(() => {
                this.dataReady = true
                if (this.startExpanded) {
                    setTimeout(() => {
                        this.$refs.tree.findAll({}).expand()
                    }, 0)
                }
            })
        })
    }

    @Watch('page')
    pageChanged () {
        this.loadTaxonomy()
    }

    openTaxonomy (term) {
        this.taxonomyTermStack.push(term)
        this.taxonomyUrlStack.push(term.links.self)
        this.pageStack.push(this.page)
        this.page = 1
        this.loadTaxonomy()
    }

    taxonomyUp () {
        this.taxonomyUrlStack.pop()
        this.taxonomyTermStack.pop()
        this.page = this.pageStack.pop()
        this.loadTaxonomy()
    }

    get parentListTerm () {
        if (this.taxonomyTermStack.length) {
            return this.taxonomyTermStack[this.taxonomyTermStack.length - 1]
        }
    }

    get localTaxonomyUrl () {
        if (this.taxonomyUrlStack.length > 0) {
            return this.taxonomyUrlStack[this.taxonomyUrlStack.length - 1]
        }
    }

    get hasParent () {
        return this.taxonomyUrlStack.length
    }

    search () {
        this.activatedFilter = this.filter
        if (this.page !== 1) {
            this.page = 1
        } else {
            this.loadTaxonomy()
        }
    }
}

export { TaxonomyMixin }
