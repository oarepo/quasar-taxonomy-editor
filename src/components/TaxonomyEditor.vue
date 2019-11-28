<template>
<div class="container">
    <div class="tree">
        <div class="buttons row">
            <slot name="buttons-left"></slot>
            <q-btn icon="expand_more" flat color="primary" dense @click="$refs.tree.findAll({}).expand()"
                   title="expand all"></q-btn>
            <q-btn icon="expand_less" flat color="primary" dense @click="$refs.tree.findAll({}).collapse()"
                   title="collapse all"></q-btn>
            <slot name="buttons-middle"></slot>
            <q-btn icon="subdirectory_arrow_left" class="rotate-90" flat color="primary" dense @click="taxonomyUp()"
                   title="Taxonomy up" v-if="parentTaxonomyUrl"></q-btn>
            <div class="title q-mt-sm q-ml-md" v-if="subtree">
                <slot name="title" v-bind:subtree="subtree">
                    <component :is="viewComponent" :taxonomy-code="taxonomyCode"
                               :term="subtree"></component>
                </slot>
            </div>
            <slot name="buttons-right"></slot>
            <q-space/>
            <q-input v-model="filter" dense class="q-mr-lg print-hide">
                <template v-slot:append>
                <q-icon v-if="filter !== ''" name="close" @click="filter = ''" class="cursor-pointer"/>
                <q-icon name="search"/>
                </template>
            </q-input>

        </div>
        <tree :data="data" :options="opts" :filter="filter" ref="tree"
              @tree:mounted="onTreeMounted"
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
                                    <component :is="viewComponent" :taxonomy-code="taxonomyCode"
                                               :term="node.data"></component>
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
    <q-btn round @click="addNode" icon="add" color="primary" class="print-hide"></q-btn>
</div>
</template>

<script>
import { Component, Watch } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import DefaultEditDialogComponent from './DefaultEditDialogComponent.vue'
import { TaxonomyMixin } from './TaxonomyMixin'
import DefaultViewComponent from './DefaultViewComponent.vue'

export default @Component({
    name: 'taxonomy-editor',
    props: {
        'editDialogComponent': [Object, Function]
    }
})
class TaxonomyEditor extends mixins(TaxonomyMixin) {
    filter = ''
    treeSort = {
        recursive: false,
        order: 'asc'
    }

    @Watch('treeSort.order')
    changeTreeOrder () {
        this.sortTree()
    }

    @Watch('treeSort.recursive')
    changeTreeRecursiveSort () {
        this.sortTree()
    }

    get opts () {
        return {
            // minFetchDelay: 1000,
            // fetchData: node => Promise.resolve(this.data[node.id - 1]),
            checkbox: false,
            dnd: true,
            filter: this.filterOptions
        }
    }

    onTreeMounted () {
        window.t = this.$refs.tree
        this.sortTree()
    }

    titleSort (node0, node1) {
        // TODO: take locale into account
        let r = (node0.data.title[0].value < node1.data.title[0].value)
        let p = this.treeSort.order === 'asc' ? 1 : -1
        if (!r) {
            return p
        }
        return -p
    }

    sortTree () {
        this.$refs.tree.sortTree(
            this.titleSort,
            this.treeSort.recursive
        )
    }

    editNode (node) {
        this.$q.dialog({
            component: this.editComponent,
            taxonomyNode: node.data,
            persistent: true
        }).onOk(data => {
            this.$axios.patch(node.data.links.self, data).then(data => {
                node.data = data.data
                this.sortTree()
            })
        })
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
                this.sortTree()
            }).catch(error => {
                if (error.response.status === 409) {
                    const recnum = error.response.data.message.records.length
                    console.log(recnum)
                    this.$q.notify({
                        message: `Tento pojem je použit ve ${recnum} existujících záznamech.` +
                            'Odeberte jej prosím nejdříve z těchto záznamů',
                        color: 'red',
                        position: 'center',
                        icon: 'block'
                    })
                } else {
                    console.log('failed to delete term')
                }
            })
        })
    }

    addChildNode (node) {
        this.$q.dialog({
            component: this.editComponent,
            persistent: true
        }).onOk(data => {
            this.$axios.post(node.data.links.self, data).then(data => {
                // add to the child node
                this.$refs.tree.append(node, { data: data.data })
                node.expand()
                this.sortTree()
            })
        })
    }

    addNode () {
        this.$q.dialog({
            component: this.editComponent,
            persistent: true
        }).onOk(data => {
            this.$axios.post(this.localTaxonomyUrl, data).then(data => {
                // add the node top-level
                this.$refs.tree.append({ data: data.data })
                this.sortTree()
            })
        })
    }

    get editComponent () {
        return this.editDialogComponent || this.$taxonomies.editors[this.taxonomyCode] || DefaultEditDialogComponent
    }

    dragStart (node) {
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

    get viewComponent () {
        return this.$taxonomies.viewers[this.taxonomyCode] || this.$taxonomies.defaultViewer || DefaultViewComponent
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
