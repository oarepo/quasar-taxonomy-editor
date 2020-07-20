<template>
<div class="container q-mt-lg">
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

        <template v-slot:menu="{parentUrl}">
        <slot name="menu" v-bind:parentUrl="parentUrl"></slot>
        </template>

        <template v-slot:term-buttons="{term, node}">
        <taxonomy-editor-buttons
            :taxonomy="taxonomyCode" :term="term" :node="node"
            :permissions="$taxonomies.termPermissions(taxonomyCode, term)"
            @edit-term="editTerm"
            @add-child-term="addChildNode"
            @remove-term="removeNode"
            @move-term="moveNode"
        ></taxonomy-editor-buttons>
        </template>
    </taxonomy-tree>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import TaxonomyEditorButtons from './TaxonomyEditorButtons.vue'
import TaxonomyTree from '../TaxonomyTree.vue'
import EditDialog from '../dialogs/EditDialog.vue'
import MoveDialog from 'app/library/components/dialogs/MoveDialog'

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
            title: this.$t('taxonomy.deleteDialog.title'),
            message: this.$t('taxonomy.deleteDialog.message'),
            cancel: true,
            focus: 'cancel',
            persistent: true
        }).onOk(() => {
            this.$axios.delete(term.links.self).then(() => {
                node.remove()
            }).catch(error => {
                if (error.response.status === 409) {
                    this.$q.notify({
                        message: this.$t('taxonomy.deleteDialog.referenced'),
                        color: 'red',
                        position: 'center',
                        icon: 'block'
                    })
                } else if (error.response.status === 412) {
                    this.$q.notify({
                        message: this.$t('taxonomy.deleteDialog.locked'),
                        color: 'red',
                        position: 'center',
                        icon: 'block'
                    })
                } else {
                    console.error('failed to delete term')
                }
            })
        })
    }

    moveNode ({ term, node }) {
        this.$q.dialog({
            parent: this,
            component: MoveDialog,
            taxonomyCode: this.taxonomyCode,
            term: term
        }).onOk(() => {
            this.$refs.tree.loadTaxonomy()
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
