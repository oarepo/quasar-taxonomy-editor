<template>
<div class="container">
    <!--
        <div class="example-description">
            <q-input type="text" placeholder="Type to filter..." v-model="filter" class="filter-field"></q-input>
        </div>
    -->
    <div class="tree">
        <div class="buttons">
            <q-btn icon="expand_more" flat color="primary" dense @click="$refs.tree.findAll({}).expand()"
                   title="expand all"></q-btn>
            <q-btn icon="expand_less" flat color="primary" dense @click="$refs.tree.findAll({}).collapse()"
                   title="collapse all"></q-btn>
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
                        <slot :name="`item:${taxonomyCode || 'default'}`">
                            <slot name="item">
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
        'editDialogComponent': [Object, Function]
    }
})
class TaxonomyEditor extends Vue {
    filter = null
    opts = {
        // minFetchDelay: 1000,
        // fetchData: node => Promise.resolve(this.data[node.id - 1]),
        checkbox: false,
        dnd: true
    }
    data = []
    dataReady = false

    mounted () {
        this.loadTaxonomy()
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
            this.$axios.post(this.taxonomyUrl, data).then(data => {
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
    loadTaxonomy () {
        this.dataReady = false
        if (this.taxonomyUrl !== undefined) {
            this.$axios.get(this.taxonomyUrl, {
                headers: {
                    'Accept': 'application/json; drilldown=true'
                }
            }).then(data => {
                this.data = this.processData(data.data)
                console.log(this.data)
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
        this.$axios.post(node.data.links.self, {
            move_target: node.parent ? node.parent.data.links.self : '/'
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
</style>
