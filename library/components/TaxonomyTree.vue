<template>
<div class="tree">
    <div class="buttons row">
        <slot name="buttons-left" v-bind:parentUrl="parentUrl"></slot>
        <q-btn flat color="primary" dense @click="taxonomyUp()"
               title="Taxonomy up" v-if="hasParent">
            <q-icon name="subdirectory_arrow_left" class="rotate-90"></q-icon>
            <div class="row q-mr-sm" v-if="parentListTerm">
                <div class="title row q-mt-sm q-ml-sm q-mr-sm">
                    <slot name="title" v-bind:subtree="parentListTerm" v-bind:parentUrl="parentUrl">
                        <taxonomy-term :term="parentListTerm" :taxonomy-code="taxonomyCode"
                                       usage="title"></taxonomy-term>
                    </slot>
                </div>
            </div>
        </q-btn>
        <div class="q-mr-md row q-py-xs">
            <q-separator vertical spaced color="secondary" v-if="hasParent"></q-separator>
        </div>
        <q-btn icon="expand_more" flat color="primary" dense @click="expand"
               title="expand all"></q-btn>
        <q-btn icon="expand_less" flat color="primary" dense
               @click="collapse"
               title="collapse all"></q-btn>
        <q-btn icon="refresh" flat color="primary" dense @click="loadTaxonomy"
               title="refresh"></q-btn>
        <q-btn flat color="primary" dense @click="singleLevel = !singleLevel; loadTaxonomy()"
               title="list/hierarchy">
            <q-icon name="view_headline" v-if="singleLevel"></q-icon>
            <q-icon name="vertical_split" class="rotate-180" v-else></q-icon>
        </q-btn>
        <slot name="buttons-middle" v-bind:parentUrl="parentUrl"></slot>
        <q-space/>
        <q-pagination v-model="page" :max="maxPage" :direction-links="true" :max-pages="6"
                      class="paginator order-md-last" v-if="maxPage > 1" color="secondary"></q-pagination>
        <q-space/>
        <slot name="buttons-right" v-bind:parentUrl="parentUrl"></slot>
        <q-space/>
        <q-input v-model="filter" dense class="q-mr-lg print-hide" @keyup.enter="search()">
            <template v-slot:append>
            <q-icon v-if="filter !== ''" name="close" @click="filter = ''; search()" class="cursor-pointer"/>
            <q-icon name="search"/>
            </template>
        </q-input>
        <slot name="buttons-end" v-bind:parentUrl="parentUrl"></slot>
    </div>
    <slot name="after-header" v-bind:parentUrl="parentUrl"></slot>
    <tree :data="data" :options="treeOptions" ref="tree"
          v-if="dataReady"
          @node:clicked="clicked($event.data)"
          @node:checked="checked($event.data)"
          @node:unchecked="unchecked($event.data)"
    >
        <div slot-scope=" { node } " class="node-container full-width">
            <div class="row">
                <div class="col">
                    <slot :name="`term-${taxonomyCode || 'default'}`" v-bind:item="node.data">
                        <slot name="term" v-bind:item="node.data">
                            <div :class="{'node-text': true}">
                                <taxonomy-term :term="node.data" :taxonomy-code="taxonomyCode"
                                               usage="tree"></taxonomy-term>
                            </div>
                        </slot>
                    </slot>
                </div>
                <div class="node-controls row">
                    <q-badge color="primary" size="sm" outline v-if="node.data.descendants_count">
                        {{node.data.descendants_count}}
                    </q-badge>
                    <q-btn href="#" @click.stop="openTaxonomy({term: node.data, node})" flat icon="fullscreen"
                           size="sm"
                           color="primary" v-if="node.data.descendants_count>0"></q-btn>
                    <slot name="term-buttons" v-bind:term="node.data" v-bind:node="node"></slot>
                </div>
            </div>
        </div>
    </tree>
</div>
</template>

<script>
import { Component, Watch, Vue } from 'vue-property-decorator'
import LiquorTree from 'liquor-tree'

function arraysDiffer (a, b) {
    a = a.map(x => x.slug)
    b = b.map(x => x.slug)
    a.sort()
    b.sort()
    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return true
    }
    return false
}

function arrayContains (arr, x) {
    for (let i = 0; i < arr.length; ++i) {
        if (arr[i].slug === x.slug) return true
    }
    return false
}

export default @Component({
    name: 'taxonomy-tree',
    components: {
        tree: LiquorTree
    },
    props: {
        taxonomyCode: String,
        startExpanded: Boolean,
        treeOptions: {
            type: Object,
            default: () => ({
                checkbox: false,
                dnd: false
            })
        },
        initialSize: {
            type: Number,
            default: 50
        },
        multiple: {
            type: Boolean,
            default: false
        },
        value: [Object, Array] // selected items
    }
})
class TaxonomyTree extends Vue {
    filter = ''
    activatedFilter = ''
    data = []
    dataReady = false
    taxonomyUrlStack = []
    taxonomyTermStack = []
    pageStack = []
    page = 1
    size = 0
    total = 0
    singleLevel = false
    selected = []
    checkRunning = false

    mounted () {
        this.size = this.initialSize
        this.loadTaxonomy()
    }

    @Watch('value')
    valueChanged () {
        if (this.value === null || this.value === undefined) {
            if (this.selected.length) {
                this.selected = []
            }
        } else if (Array.isArray(this.value)) {
            if (arraysDiffer(this.value, this.selected)) {
                this.selected = [...this.value]
            }
        } else {
            if (this.selected.length !== 1 || this.selected[0] !== this.value) {
                this.selected = [this.value]
            }
        }
        this.later(() => {
            this.check()
        })
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
            filter: this.activatedFilter,
            levels: this.singleLevel ? 1 : undefined
        }).then(({ terms, total }) => {
            // terms starts with taxonomy node
            this.data = this.processData(terms.children)
            this.total = total
            this.dataReady = false
            this.$nextTick(() => {
                this.dataReady = true
                if (this.startExpanded) {
                    this.later(() => {
                        this.$refs.tree.findAll({}).expand()
                    })
                }
                this.later(() => {
                    this.valueChanged()
                    this.$emit('loaded', {
                        tree: this,
                        page: this.page,
                        terms: terms,
                        total: this.total,
                        size: this.size
                    })
                })
            })
        })
    }

    @Watch('page')
    pageChanged () {
        this.loadTaxonomy()
    }

    openTaxonomy ({ term, node }) {
        this.taxonomyTermStack.push(term)
        this.taxonomyUrlStack.push(term.links.self)
        this.pageStack.push(this.page)
        if (this.page !== 1) {
            this.page = 1 // no need to reload as it is automatic on page change
        } else {
            this.loadTaxonomy()
        }
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

    get maxPage () {
        return Math.ceil(this.total / (this.size || 1))
    }

    get parentUrl () {
        // returns local url (if nested) or the collection's url
        return this.localTaxonomyUrl || this.$taxonomies.taxonomyUrl(this.taxonomyCode)
    }

    prepend (...params) {
        const node = this.$refs.tree.prepend(...params)
        node.select()
    }

    check () {
        this.checkRunning = true
        console.log('chec called', this.selected)
        this.selected.forEach(term => {
            const selection = this.$refs.tree.find({ data: { slug: term.slug } })
            if (selection) {
                selection.check()
            }
        });
        (this.$refs.tree.checked() || []).forEach(node => {
            if (!arrayContains(this.selected, node.data)) {
                console.log('chec removing', this.selected, node.data)
                node.uncheck()
            }
        })
        this.checkRunning = false
    }

    later (f) {
        const self = this
        const cnt = []

        function l () {
            if (!self.$refs || !self.$refs.tree) {
                if (cnt.length < 5) {
                    cnt.push(1)
                    setTimeout(l, 100 * cnt.length)
                }
            } else {
                f()
            }
        }

        setTimeout(l, 0)
    }

    expand () {
        this.later(() => this.$refs.tree.findAll({}).expand())
    }

    collapse () {
        this.later(() => this.$refs.tree.findAll({}).collapse())
    }

    clicked (term) {
        if (term.descendants_count > 0) {
            return
        }
        this.selected = [term]
        this.$emit('input', this.selected)
    }

    checked (term) {
        if (this.checkRunning) {
            return
        }
        console.log('check called', term)
        for (const t of this.selected) {
            if (t.slug === term.slug) {
                return
            }
        }
        if (this.multiple) {
            this.selected.push(term)
        } else {
            this.selected = [term]
        }
        this.$emit('input', this.selected)
    }

    unchecked (term) {
        if (this.checkRunning || this.multiple) {
            return
        }
        console.log('uncheck called', term)
        const prevSelected = this.selected
        this.selected = this.selected.filter(x => x !== term)
        if (prevSelected.length !== this.selected.length) {
            this.$emit('input', this.selected)
        }
    }
}
</script>

<style lang="stylus" scoped>
.tree
    min-height 10vh

    .buttons
        margin-left: 0px

    .title
        color: $secondary

    .new
        padding-top: 10px
        padding-bottom: 10px
        background-color: lightyellow
</style>
