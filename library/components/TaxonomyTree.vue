<template>
<div class="container q-mt-lg">
    <div class="tree">
        <div class="buttons row">
            <slot name="buttons-left"></slot>
            <q-btn flat color="primary" dense @click="taxonomyUp()"
                   title="Taxonomy up" v-if="hasParent">
                <q-icon name="subdirectory_arrow_left" class="rotate-90"></q-icon>
                <div class="row q-mr-sm" v-if="parentListTerm">
                    <div class="title row q-mt-sm q-ml-sm q-mr-sm">
                        <slot name="title" v-bind:subtree="parentListTerm">
                            <component :is="getTermViewComponent(parentListTerm)" :taxonomy-code="taxonomyCode"
                                       :term="parentListTerm"></component>
                        </slot>
                    </div>
                </div>
            </q-btn>
            <div class="q-mr-md row q-py-xs">
                <q-separator vertical spaced color="secondary" v-if="hasParent"></q-separator>
            </div>
            <q-btn icon="expand_more" flat color="primary" dense @click="$refs.tree.findAll({}).expand()"
                   title="expand all"></q-btn>
            <q-btn icon="expand_less" flat color="primary" dense @click="$refs.tree.findAll({}).collapse()"
                   title="collapse all"></q-btn>
            <slot name="buttons-middle"></slot>
            <slot name="buttons-right"></slot>
            <q-space/>
            <q-input v-model="filter" dense class="q-mr-lg print-hide" @keyup.enter="search()">
                <template v-slot:append>
                <q-icon v-if="filter !== ''" name="close" @click="filter = ''; search()" class="cursor-pointer"/>
                <q-icon name="search"/>
                </template>
            </q-input>
        </div>
        <tree :data="data" :options="treeOptions" ref="tree"
              @tree:mounted="onTreeMounted"
              @node:dragging:start="dragStart"
              @node:dragging:finish="dragFinish"
              v-if="dataReady"
        >
            <div slot-scope=" { node } " class="node-container full-width">
                <div class="row">
                    <div class="col">
                        <slot :name="`term-${taxonomyCode || 'default'}`" v-bind:item="node.data">
                            <slot name="term" v-bind:item="node.data">
                                <div class="node-text">
                                    <component :is="getTermViewComponent(node.data)" :taxonomy-code="taxonomyCode"
                                               :term="node.data"></component>
                                </div>
                            </slot>
                        </slot>
                    </div>
                    <div class="node-controls">
                        <q-badge color="primary" size="sm" outline v-if="term.descendants_count">
                            {{term.descendants_count}}
                        </q-badge>
                        <q-btn href="#" @click.stop="openTaxonomy({term: node.data, node})" flat icon="fullscreen"
                               size="sm"
                               color="primary" v-if="node.data.descendants_count>0"></q-btn>
                        <slot name="term-buttons" v-bind:term="node.data" v-bind:node="node"></slot>
                    </div>
                </div>
            </div>
        </tree>
        <div class="row justify-around">
            <q-pagination v-model="page" :max="maxPage" :direction-links="true" :max-pages="6"
                          class="paginator" v-if="maxPage > 1"></q-pagination>
        </div>
    </div>
</div>
</template>

<script>
import { Component, Watch, Vue } from 'vue-property-decorator'

export default @Component({
    name: 'taxonomy-tree',
    props: {
        taxonomyCode: String,
        startExpanded: Boolean,
        treeOptions: {
            type: Object,
            default: () => ({
                checkbox: false,
                dnd: false
            })
        }
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
    size = 50
    total = 0

    getTermViewComponent (term) {
        return this.$taxonomies.getTermViewComponent({
            taxonomy: this.taxonomyCode,
            term: term
        })
    }

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

    openTaxonomy ({ term, node }) {
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

    get maxPage () {
        return Math.ceil(this.total / (this.size || 1))
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
</style>
