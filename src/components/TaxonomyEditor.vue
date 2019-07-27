<template>
<div class="container">
    <!--
        <div class="example-description">
            <q-input type="text" placeholder="Type to filter..." v-model="filter" class="filter-field"></q-input>
        </div>
    -->
    <div class="tree">
        <div class="buttons row">
            <q-btn icon="expand_more" flat color="primary" dense @click="$refs.tree.findAll({}).expand()"
                   title="expand all"></q-btn>
            <q-btn icon="expand_less" flat color="primary" dense @click="$refs.tree.findAll({}).collapse()"
                   title="collapse all"></q-btn>
            <q-btn icon="subdirectory_arrow_left" class="rotate-90" flat color="primary" dense @click="taxonomyUp()"
                   title="Taxonomy up" v-if="parentTaxonomyUrl"></q-btn>
            <div class="title q-mt-sm q-ml-md" v-if="subtree">
                <slot name="title" v-bind:subtree="subtree">
                    {{ subtree.title }}
                </slot>
            </div>
            <q-space/>
            <q-input v-model="filter" dense class="q-mr-lg">
                <template v-slot:append>
                <q-icon v-if="filter !== ''" name="close" @click="filter = ''" class="cursor-pointer"/>
                <q-icon name="search"/>
                </template>
            </q-input>

        </div>
        <tree :data="data" :options="opts" :filter="filter" ref="tree"
              @node:editing:start="editNode"
              @node:editing:stop="editNodeStop"
              @node:dragging:start="dragStart"
              @node:dragging:finish="dragFinish"
              v-if="dataReady"
        >
            <div slot-scope=" { node } " class="node-container full-width">
                <div class="row">
                    <div class="col">
                        <slot :name="`item-${taxonomyCode || 'default'}`" v-bind:item="node.data">
                            <slot name="item" v-bind:item="node.data">
                                <div class="node-text">
                                    {{ node.data.title && (
                                    node.data.title[$q.lang.getLocale()] || node.data.title._ || node.data.title)
                                    }}
                                </div>
                            </slot>
                        </slot>
                    </div>
                    <div class="node-controls">
                        <q-btn href="#" @click.stop="editNode(node)" flat icon="edit" size="sm" color="primary"></q-btn>
                        <q-btn href="#" @click.stop="addChildNode(node)" flat icon="playlist_add" size="sm"
                               color="primary"></q-btn>
                        <q-btn href="#" @click.stop="openTaxonomy(node)" flat icon="fullscreen" size="sm"
                               color="primary" v-if="node.data.descendants_count>0"></q-btn>
                        <q-btn href="#" @click.stop="removeNode(node)" flat icon="remove" size="sm" color="red"></q-btn>
                    </div>
                </div>
            </div>
        </tree>
    </div>
    <q-btn round @click="addNode" icon="add" color="primary"></q-btn>
</div>
</template>

<script>
import { Vue, Component, Watch } from 'vue-property-decorator'
import LiquorTree from 'liquor-tree'
import DefaultEditDialogComponent from './DefaultEditDialogComponent.vue'

export default @Component({
    components: {
        'tree': LiquorTree
    },
    name: 'taxonomy-editor',
    props: {
        'taxonomyUrl': String,
        'taxonomyCode': String,
        'editDialogComponent': [Object, Function],
        'filterMatcher': Function
    }
})
class TaxonomyEditor extends Vue {
    filter = ''
    opts = {
        // minFetchDelay: 1000,
        // fetchData: node => Promise.resolve(this.data[node.id - 1]),
        checkbox: false,
        dnd: true,
        filter: {
            emptyText: 'Nothing found!',
            matcher: (query, node) => {
                if (this.filterMatcher) {
                    return this.filterMatcher(query, node)
                }
                const val = JSON.stringify(node.data)
                return new RegExp(query, 'i').test(val)
            },
            plainList: false,
            showChildren: true
        }
    }
    data = []
    dataReady = false
    localTaxonomyUrl = null
    parentTaxonomyUrl = null
    subtree = null

    mounted () {
        this.onTaxonomyUrl()
    }

    editNode (node) {
        this.$q.dialog({
            component: this.editDialogComponent || DefaultEditDialogComponent,
            taxonomyNode: node.data,
            persistent: true
        }).onOk(data => {
            this.$axios.patch(node.data.links.self, data).then(data => {
                node.data = data.data
            })
        })
        console.log(node)
    }

    editNodeStop (node) {
        // node.startEditing()
    }

    removeNode (node) {
        this.$q.dialog({
            title: 'Deleting taxonomy term',
            message: 'Do you really want to delete taxonomy term?',
            cancel: true,
            persistent: true
        }).onOk(() => {
            this.$axios.delete(node.data.links.self).then(() => {
                node.remove()
            })
        })
    }

    addChildNode (node) {
        this.$q.dialog({
            component: this.editDialogComponent || DefaultEditDialogComponent,
            persistent: true
        }).onOk(data => {
            this.$axios.post(node.data.links.self, data).then(data => {
                // add to the child node
                this.$refs.tree.append(node, { data: data.data })
                node.expand()
            })
        })
    }

    addNode () {
        this.$q.dialog({
            component: this.editDialogComponent || DefaultEditDialogComponent,
            persistent: true
        }).onOk(data => {
            this.$axios.post(this.localTaxonomyUrl, data).then(data => {
                // add the node top-level
                this.$refs.tree.append({ data: data.data })
            })
        })
    }

    processData (data) {
        return data.map(x => {
            if (x.children !== undefined) {
                x.children = this.processData(x.children)
            }
            x.data = { ...x }
            delete x.data.children
            return x
        })
    }

    @Watch('taxonomyUrl')
    onTaxonomyUrl () {
        console.log('taxonomy url', this.taxonomyUrl)
        if (this.taxonomyUrl !== undefined) {
            this.localTaxonomyUrl = this.taxonomyUrl
            this.loadTaxonomy()
        }
    }

    loadTaxonomy () {
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
                    console.log(data.data)
                    this.parentTaxonomyUrl = data.data.links.parent_tree || null
                    this.data = this.processData(data.data.children)
                    this.subtree = data.data
                }
                this.$nextTick(() => {
                    this.dataReady = true
                })
            })
        } else {
            this.data = []
        }
    }

    dragStart (node) {
        console.log('Start dragging: ', node.data.id)
    }

    dragFinish (node, targetNode, dropPosition) {
        this.$axios.post(node.data.links.self, '', {
            headers: {
                'Destination': targetNode.data.links.self,
                'Destination-Order': {
                    'drag-on': 'inside',
                    'drag-above': 'before',
                    'drag-below': 'after'
                }[dropPosition],
                'Content-Type': 'application/vnd.move'
            }
        }).then(resp => {
            console.log('Dragging finished', resp)
        })
    }

    openTaxonomy (node) {
        this.localTaxonomyUrl = node.data.links.tree
        this.loadTaxonomy()
    }

    taxonomyUp () {
        this.localTaxonomyUrl = this.parentTaxonomyUrl
        this.loadTaxonomy()
    }
}
</script>

<style lang="stylus" scoped>
.tree
    min-height 40vh

    .buttons
        margin-left: 0px

    .title
        color: $secondary
</style>
