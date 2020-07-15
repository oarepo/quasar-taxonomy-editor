<template>
<div>
    <q-field :label="label" :value="internalValidationValue" :rules="this.rules" :lazy-rules="lazyRules" stack-label
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
</div>
</template>
<script>
import { Component, Emit, Watch } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import { TaxonomyMixin } from './TaxonomyMixin'
import DefaultViewComponent from './DefaultTermViewComponent.vue'
import DialogTaxonomyInputDialog from './DialogTaxonomyInputDialog.vue'

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
            this.resetValidation()
        })
    }

    resetValidation () {
        if (this.$refs.field) {
            this.$refs.field.resetValidation()
        } else {
            this.$nextTick(() => {
                this.resetValidation()
            })
        }
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
            this.$q.dialog({
                component: DialogTaxonomyInputDialog,
                value: this.selectedTerms,
                taxonomyUrl: this.taxonomyUrl,
                taxonomyCode: this.taxonomyCode,
                filterMatcher: this.filterMatcher,
                multiple: this.multiple
            }).onOk(terms => {
                this.selectedTerms = terms
                this.validateAndEmit()
            })
        })
    }

    removeSelected (term) {
        this.selectedTerms = this.selectedTerms.filter(x => x.links.self !== term.links.self)
        this.validateAndEmit()
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
        return this.$taxonomies.termViewers[this.taxonomyCode] || this.$taxonomies.defaultViewer || DefaultViewComponent
    }

    get internalValidationValue () {
        if (this.multiple) {
            return this.selectedTerms
        }
        if (this.selectedTerms.length) {
            return this.selectedTerms[0]
        }
        return null
    }

    validate (val) {
        return this.$refs.field.validate(val)
    }

    validateAndEmit () {
        this.$nextTick(() => {
            // validate and emit in the next tick as the selectedTerms has to propagate to qfield in order
            // to be validated
            Promise.resolve(this.validate()).then(status => {
                if (status) {
                    this.emit()
                }
            })
        })
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
