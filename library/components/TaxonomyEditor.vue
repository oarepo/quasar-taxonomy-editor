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
            <q-btn @click="addNode" icon="add" flat dense color="positive" class="print-hide"
                   v-if="$taxonomies.termPermissions(taxonomyCode).includes('insert')"
            ></q-btn>
            <slot name="buttons-right"></slot>
            <q-space/>
            <q-input v-model="filter" dense class="q-mr-lg print-hide" @keyup.enter="search()">
                <template v-slot:append>
                <q-icon v-if="filter !== ''" name="close" @click="filter = ''; search()" class="cursor-pointer"/>
                <q-icon name="search"/>
                </template>
            </q-input>
        </div>
        <tree :data="data" :options="opts" ref="tree"
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
                                    <component :is="getTermViewComponent(node.data)" :taxonomy-code="taxonomyCode"
                                               :term="node.data"></component>
                                </div>
                            </slot>
                        </slot>
                    </div>
                    <div class="node-controls">
                        <taxonomy-editor-buttons
                            :taxonomy="taxonomyCode" :term="node.data" :node="node"
                            :permissions="$taxonomies.termPermissions(taxonomyCode, node.data)"
                            @open-taxonomy="openTaxonomy"
                            @edit-term="editTerm"
                            @add-child-node="addChildNode"
                            @remove-node="removeNode"
                        ></taxonomy-editor-buttons>
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
import { Component, Watch } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import { TaxonomyMixin } from './TaxonomyMixin'
import TaxonomyEditorButtons from './TaxonomyEditorButtons.vue'

export default @Component({
    name: 'taxonomy-editor',
    props: {
        editDialogComponent: [Object, Function]
    },
    components: {
        TaxonomyEditorButtons
    }
})
class TaxonomyEditor extends mixins(TaxonomyMixin) {
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
            dnd: false
        }
    }

    onTreeMounted () {
        window.t = this.$refs.tree
        // this.sortTree()
    }

    editTerm ({ term, node }) {
        this.$q.dialog({
            component: this.getTermEditComponent({ term: term }),
            parent: this,
            term: term,
            persistent: true
        }).onOk(data => {
            this.$axios.put(term.links.self, data).then(data => {
                Object.assign(term, data.data)
            })
        })
    }

    removeNode ({ term, node }) {
        this.$q.dialog({
            title: 'Deleting taxonomy term',
            message: 'Do you really want to delete taxonomy term?',
            cancel: true,
            persistent: true
        }).onOk(() => {
            this.$axios.delete(term.links.self).then(() => {
                node.remove()
            }).catch(error => {
                if (error.response.status === 409) {
                    const recnum = error.response.data.message.records.length
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

    _onAddError (reason) {
        console.log(reason)
        if (reason.response) {
            if (reason.response.status === 412) {
                alert('Resource already exists')
            } else {
                alert('Taxonomy error: ' + reason.response.data)
            }
        }
    }

    addChildNode ({ term, node }) {
        this.$q.dialog({
            component: this.getTermEditComponent({ parent: term }),
            parent: this,
            parentTerm: term,
            persistent: true
        }).onOk(data => {
            this.$taxonomies.addChild({ term, child: data }).then(child => {
                this.$refs.tree.prepend(node, { data: child })
                node.expand()
            }).catch(reason => this._onAddError(reason))
        })
    }

    addNode () {
        this.$q.dialog({
            component: this.getTermEditComponent({}),
            parent: this,
            persistent: true
        }).onOk(data => {
            this.$taxonomies.addChild({
                url: this.localTaxonomyUrl || this.$taxonomies.taxonomyUrl(this.taxonomyCode),
                child: data
            }).then(child => {
                // add the node top-level
                this.$refs.tree.prepend({ data: child })
            }).catch(reason => this._onAddError(reason))
        })
    }

    dragStart (node) {
    }

    dragFinish (node, targetNode, dropPosition) {
        this.$axios.post(node.data.links.self, '', {
            headers: {
                Destination: targetNode.data.links.self,
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

    getTermViewComponent (term) {
        return this.$taxonomies.getTermViewComponent({
            taxonomy: this.taxonomyCode,
            term: term
        })
    }

    getTermEditComponent ({ term, parent }) {
        return this.$taxonomies.getTermEditComponent({
            taxonomy: this.taxonomyCode,
            term: term,
            parent: parent
        })
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
