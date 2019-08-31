<template>
<div>
    <q-field :label="label" :value="this.selectedTerms" :rules="this.rules" :lazy-rules="lazyRules" stack-label
             @click.native.stop="showSelectionDialog()" ref="field">
        <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">
            <div :class="{'inline-term': inline}" v-for="selected in selectedTerms" :key="selected.links.self">
                <slot name="selected-item-wrapper" v-bind:item="selected">
                    <template v-if="multiple">
                    <q-chip outline removable color="primary" @remove="removeSelected(selected)">
                        <slot name="selected-item-multiple" v-bind:item="selected">
                            <slot name="selected-item" v-bind:item="selected">
                                <slot name="item" v-bind:item="selected">
                                    <component :is='viewComponent' :taxonomy-code="taxonomyCode" :term="selected"/>
                                </slot>
                            </slot>
                        </slot>
                    </q-chip>
                    </template>
                    <template v-else>
                    <slot name="selected-item-single" v-bind:item="selected">
                        <slot name="selected-item" v-bind:item="selected">
                            <slot name="item" v-bind:item="selected">
                                <component :is='viewComponent' :taxonomy-code="taxonomyCode" :term="selected"/>
                            </slot>
                        </slot>
                    </slot>
                    </template>
                </slot>
            </div>
        </div>
        </template>
        <template v-slot:append>
        <q-btn flat icon="close" color="primary" @click.stop="removeSelected(selectedTerms[0])"
               v-if="!multiple && selectedTerms.length"/>
        <q-btn flat icon="fas fa-hand-pointer" color="primary" @click.stop="showSelectionDialog()"
               v-if="multiple || !selectedTerms.length"/>
        </template>
    </q-field>
    <q-dialog v-model="selectorShown">
        <q-card style="width: 700px; max-width: 80vw; height: 80vw">
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
                      @node:clicked="singleValueSelectedClick"
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
import { Component, Emit, Watch } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import { TaxonomyMixin } from './TaxonomyMixin'
import DefaultViewComponent from './DefaultViewComponent.vue'

export default @Component({
    props: {
        label: String,
        inline: Boolean,
        multiple: Boolean,
        value: [Object, Array],
        rules: Array,
        lazyRules: Array
    }
})
class DialogTaxonomyInput extends mixins(TaxonomyMixin) {
    selectedTerms = []
    selectorShown = false
    filter = ''

    get opts () {
        return {
            checkbox: true,
            filter: this.filterOptions,
            autoCheckChildren: false
        }
    }

    mounted () {
        this.setInitialValue()
        this.$nextTick(() => {
            this.$refs.field.resetValidation()
        })
    }

    @Watch('value')
    setInitialValue () {
        if (this.multiple) {
            if (!this.value) {
                this.selectedTerms = []
            } else {
                this.selectedTerms = this.value
            }
        } else {
            if (this.value) {
                this.selectedTerms = [this.value]
            } else {
                this.selectedTerms = []
            }
        }
    }

    showSelectionDialog () {
        this.loadTaxonomy().then(() => {
            this.selectorShown = true
            this.$nextTick(() => {
                setTimeout(() => {
                    if (this.multiple && this.selectedTerms) {
                        this.selectedTerms.forEach(term => {
                            const selection = this.$refs.tree.find({ data: { id: term.id } })
                            if (selection) {
                                selection.check()
                            }
                        })
                    }
                }, 10)
            })
        })
    }

    singleValueSelectedClick (term) {
        if (term.children.length > 0) {
            return
        }
        this.singleValueSelected(term)
    }

    singleValueSelected (term) {
        if (this.multiple) {
            return
        }
        this.selectorShown = false
        this.selectedTerms = [term.data]
        this.emit()
    }

    multipleValuesSelected () {
        const foundTerms = this.$refs.tree.findAll({ state: { checked: true } })
        if (foundTerms !== null) {
            this.selectedTerms = foundTerms.map(x => x.data)
        } else {
            this.selectedTerms = []
        }
        this.selectorShown = false
        this.emit()
    }

    removeSelected (term) {
        this.selectedTerms = this.selectedTerms.filter(x => x.links.self !== term.links.self)
        this.emit()
    }

    @Emit('input')
    emit () {
        if (this.multiple) {
            return this.selectedTerms
        } else {
            if (this.selectedTerms.length > 0) {
                return this.selectedTerms[0]
            }
            return null
        }
    }

    get viewComponent () {
        return this.$taxonomies.viewers[this.taxonomyCode] || this.$taxonomies.defaultViewer || DefaultViewComponent
    }

    validate (val) {
        return this.$refs.field.validate(val)
    }

    get error () {
        return this.$refs.field.error
    }
}
</script>
<style scoped lang="stylus">
div.inline-term
    display inline-block
</style>
