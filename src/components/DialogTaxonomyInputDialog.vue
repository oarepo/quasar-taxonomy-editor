<template>
<div>
    <q-dialog ref="dialog" @hide="onDialogHide" @show="onDialogShow">
        <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw; height: 80vw">
            <q-card-section>

            </q-card-section>
            <q-card-section>
                <div class="buttons row">
                    <slot name="buttons-left"></slot>
                    <q-btn icon="expand_more" flat color="primary" dense @click="$refs.tree.findAll({}).expand()"
                           title="expand all"></q-btn>
                    <q-btn icon="expand_less" flat color="primary" dense @click="$refs.tree.findAll({}).collapse()"
                           title="collapse all"></q-btn>
                    <slot name="buttons-middle"></slot>
                    <q-btn icon="subdirectory_arrow_left" class="rotate-90" flat color="primary" dense
                           @click="taxonomyUp()"
                           title="Taxonomy up" v-if="parentTaxonomyUrl"></q-btn>
                    <div class="title q-mt-sm q-ml-md" v-if="subtree">
                        <slot name="title" v-bind:subtree="subtree">
                            <component :is='viewComponent' :taxonomy-code="taxonomyCode" :term="subtree"/>
                        </slot>
                    </div>
                    <slot name="buttons-right"></slot>
                    <q-space/>
                    <q-input v-model="filter" dense class="q-mr-lg">
                        <template v-slot:append>
                        <q-icon v-if="filter !== ''" name="close" @click="filter = ''" class="cursor-pointer"/>
                        <q-icon name="search"/>
                        </template>
                    </q-input>
                    <q-btn icon="check" flat color="primary" @click="multipleValuesSelected" v-if="multiple">&nbsp;OK
                    </q-btn>
                </div>
                <q-separator></q-separator>
                <tree :data="data" :options="opts" :filter="filter"
                      @node:clicked="singleValueClick"
                      @node:checked="singleValueSelected"
                      ref="tree" v-if="dataReady">
                    <div slot-scope=" { node } " class="node-container full-width">
                        <div class="row">
                            <div class="col">
                                <slot name="item" v-bind:item="node.data">
                                    <div class="node-text">
                                        <component :is='viewComponent' :taxonomy-code="taxonomyCode" :term="node.data"/>
                                    </div>
                                </slot>
                            </div>
                            <div class="node-controls">
                                <q-btn href="#" @click.stop="openTaxonomy(node)" flat icon="fullscreen" size="sm"
                                       color="primary" v-if="node.data.descendants_count>0"></q-btn>
                            </div>
                        </div>
                    </div>
                </tree>
            </q-card-section>
        </q-card>
    </q-dialog>
</div>
</template>
<script>
import { Component, Watch } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import { TaxonomyMixin } from './TaxonomyMixin'
import DefaultViewComponent from './DefaultViewComponent.vue'

export default @Component({
    props: {
        value: Array,
        multiple: Boolean
    }
})
class DialogTaxonomyInputDialog extends mixins(TaxonomyMixin) {
    selectedTerms = []
    filter = ''
    treeSort = {
        recursive: false,
        order: 'asc'
    }

    titleSort (node0, node1) {
        return new Intl.Collator(node0.data.title[0].lang).compare(node0.data.title[0].value, node1.data.title[0].value)
    }

    sortTree () {
        this.$refs.tree.sortTree(
            this.titleSort,
            this.treeSort.recursive
        )
    }

    @Watch('value')
    valueChanged () {
        this.selectedTerms = this.value || []
    }

    mounted () {
        this.valueChanged()
    }

    get opts () {
        return {
            checkbox: true,
            filter: this.filterOptions,
            autoCheckChildren: false
        }
    }

    show () {
        this.$refs.dialog.show()
    }

    hide () {
        this.$refs.dialog.hide()
    }

    onDialogHide () {
        this.$emit('hide')
    }

    onDialogShow () {
        this.sortTree()
        if (this.multiple && this.selectedTerms) {
            this.selectedTerms.forEach(term => {
                const selection = this.$refs.tree.find({ data: { id: term.id } })
                if (selection) {
                    selection.check()
                }
            })
        }
    }

    onOKClick () {
        this.$emit('ok', this.selectedTerms)
        this.hide()
    }

    onCancelClick () {
        this.hide()
    }

    singleValueClick (term) {
        if (term.children.length > 0) {
            return
        }
        if (this.multiple) {
            return
        }
        this.selectedTerms = [term.data]
        this.onOKClick()
    }

    singleValueSelected (term) {
        if (this.multiple) {
            return
        }
        this.selectedTerms = [term.data]
        if (!this.multiple) {
            this.onOKClick()
        }
    }

    multipleValuesSelected () {
        const foundTerms = this.$refs.tree.findAll({ state: { checked: true } })
        if (foundTerms !== null) {
            this.selectedTerms = foundTerms.map(x => x.data)
        } else {
            this.selectedTerms = []
        }
        this.onOKClick()
    }

    get viewComponent () {
        return this.$taxonomies.viewers[this.taxonomyCode] || this.$taxonomies.defaultViewer || DefaultViewComponent
    }
}
</script>
<style scoped lang="stylus">
div.inline-term
    display inline-block
</style>
