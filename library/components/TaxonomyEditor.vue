<template>
<div class="container q-mt-lg">
    <term-select :taxonomy-code="taxonomyCode" class="q-mb-xl"></term-select>
    <taxonomy-tree :taxonomy-code="taxonomyCode" :start-expanded="startExpanded" ref="tree">
        <template v-slot:buttons-middle="{parentUrl}">
            <slot name="buttons-middle" v-bind:parentUrl="parentUrl"></slot>
            <q-btn @click="addNode(parentUrl)" icon="add" flat dense color="positive" class="print-hide"
                   v-if="$taxonomies.termPermissions(taxonomyCode).includes('insert')">
            </q-btn>
        </template>
        <template v-slot:buttons-right="{parentUrl}">
            <slot name="buttons-right" v-bind:parentUrl="parentUrl"></slot>
        </template>

        <template v-slot:term-buttons="{term, node}">
        <taxonomy-editor-buttons
            :taxonomy="taxonomyCode" :term="term" :node="node"
            :permissions="$taxonomies.termPermissions(taxonomyCode, term)"
            @edit-term="editTerm"
            @add-child-node="addChildNode"
            @remove-node="removeNode"
        ></taxonomy-editor-buttons>
        </template>
    </taxonomy-tree>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import TaxonomyEditorButtons from './TaxonomyEditorButtons.vue'
import TaxonomyTree from './TaxonomyTree.vue'
import EditDialog from './EditDialog.vue'

export default @Component({
    name: 'taxonomy-editor',
    props: {
        taxonomyCode: String,
        startExpanded: {
            type: Boolean,
            default: true
        }
    },
    components: {
        TaxonomyEditorButtons,
        TaxonomyTree
    }
})
class TaxonomyEditor extends Vue {
    editTerm ({ term, node }) {
        this.$q.dialog({
            component: EditDialog,
            editor: this.getTermEditComponent({ term: term }),
            async saveOperation ({ model }) {
                try {
                    return (await this.$axios.put(term.links.self, model)).data
                } catch (e) {
                    if (e.response && e.response.data && e.response.data instanceof Object) {
                        throw e.response.data
                    } else {
                        throw e
                    }
                }
            },
            parent: this,
            initial: term,
            persistent: true
        }).onOk(data => {
            Object.assign(term, data)
            node.data = term
        })
    }

    addChildNode ({ term, node }) {
        this.$q.dialog({
            component: EditDialog,
            editor: this.getTermEditComponent({ parent: term }),
            parent: this,
            persistent: true,
            async saveOperation ({ model, slug }) {
                try {
                    return (await this.$taxonomies.addChild({ term, child: { ...model, slug } }))
                } catch (e) {
                    if (e.response && e.response.data && e.response.data instanceof Object) {
                        throw e.response.data
                    } else {
                        throw e
                    }
                }
            }
        }).onOk(data => {
            this.$refs.tree.prepend(node, { data: data })
            node.expand()
        })
    }

    addNode (parentUrl) {
        this.$q.dialog({
            component: EditDialog,
            editor: this.getTermEditComponent({}),
            parent: this,
            persistent: true,
            async saveOperation ({ model, slug }) {
                try {
                    return (await this.$taxonomies.addChild({
                        url: parentUrl,
                        child: { ...model, slug }
                    }))
                } catch (e) {
                    if (e.response && e.response.data && e.response.data instanceof Object) {
                        throw e.response.data
                    } else {
                        throw e
                    }
                }
            }
        }).onOk(data => {
            this.$refs.tree.prepend({ data: data })
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

    //
    // _onAddError (reason) {
    //     console.log(reason)
    //     if (reason.response) {
    //         if (reason.response.status === 412) {
    //             alert('Resource already exists')
    //         } else {
    //             alert('Taxonomy error: ' + reason.response.data)
    //         }
    //     }
    // }

    //
    // dragStart (node) {
    // }
    //
    // dragFinish (node, targetNode, dropPosition) {
    //     this.$axios.post(node.data.links.self, '', {
    //         headers: {
    //             Destination: targetNode.data.links.self,
    //             'Destination-Order': {
    //                 'drag-on': 'inside',
    //                 'drag-above': 'before',
    //                 'drag-below': 'after'
    //             }[dropPosition],
    //             'Content-Type': 'application/vnd.move'
    //         }
    //     }).then(resp => {
    //         console.log('Dragging finished', resp)
    //     })
    // }

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
