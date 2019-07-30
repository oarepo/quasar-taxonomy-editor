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
                    {{ subtree.title }}
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
    <q-btn round @click="addNode" icon="add" color="primary" class="print-hide"></q-btn>
</div>
</template>

<script>
import { Component } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import DefaultEditDialogComponent from './DefaultEditDialogComponent.vue'
import { TaxonomyMixin } from './TaxonomyMixin'

export default @Component({
    name: 'taxonomy-editor',
    props: {
        'editDialogComponent': [Object, Function]
    }
})
class TaxonomyEditor extends mixins(TaxonomyMixin) {
    filter = ''

    get opts () {
        return {
            // minFetchDelay: 1000,
            // fetchData: node => Promise.resolve(this.data[node.id - 1]),
            checkbox: false,
            dnd: true,
            filter: this.filterOptions
        }
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
