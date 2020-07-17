<template>
<div>
    <q-dialog ref="dialog" @hide="onDialogHide" @show="showSelectedTerms">
        <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw; ">
            <q-card-section class="q-mt-lg">
                <taxonomy-tree :taxonomy-code="taxonomyCode" :start-expanded="true" :tree-options="opts" ref="tree"
                               @clicked="singleValueClick" @selected="valueSelected" @unselected="valueUnselected"
                               @loaded="showSelectedTerms"
                               :initial-size="10">
                </taxonomy-tree>
            </q-card-section>
            <q-card-section v-if="multiple">
                <div class="row items-end q-gutter-md">
                    <q-field class="col" label="Selected" stack-label>
                        <template v-slot:control>
                        <div class="row items-end q-gutter-sm">
                            <q-chip removable v-for="term in selectedTerms" :key="term.slug" color="primary" dark
                                    @remove="valueUnselected(term, true)">
                                {{ term.slug }}
                            </q-chip>
                        </div>
                        </template>
                    </q-field>
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn @click="hide" flat color="grey">Cancel</q-btn>
                <q-btn @click="onOKClick" flat color="positive" icon="done"  v-if="multiple"><span class="q-pl-sm">Ok</span>
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</div>
</template>
<script>
import { Component, Watch, Vue } from 'vue-property-decorator'
import TaxonomyTree from './TaxonomyTree.vue'

export default @Component({
    props: {
        taxonomyCode: String,
        value: Array,
        multiple: Boolean
    },
    components: {
        TaxonomyTree
    }
})
class DialogTaxonomyInputDialog extends Vue {
    selectedTerms = []

    @Watch('value')
    valueChanged () {
        this.selectedTerms = this.value || []
    }

    get opts () {
        return {
            checkbox: true,
            autoCheckChildren: false
        }
    }

    show () {
        this.valueChanged()
        this.$refs.dialog.show()
    }

    hide () {
        this.$refs.dialog.hide()
    }

    onDialogHide () {
        this.$emit('hide')
    }

    showSelectedTerms () {
        if (this.multiple && this.selectedTerms) {
            this.$refs.tree.check(this.selectedTerms)
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
        if (term.descendants_count > 0) {
            return
        }
        if (this.multiple) {
            return
        }
        this.selectedTerms = [term]
        this.onOKClick()
    }

    valueSelected (term) {
        if (this.multiple) {
            this.selectedTerms.push(term)
        } else {
            this.selectedTerms = term
        }
        if (!this.multiple) {
            this.onOKClick()
        }
    }

    valueUnselected (term, removeFromTree) {
        this.selectedTerms = this.selectedTerms.filter(x => x !== term)
        if (removeFromTree) {
            this.showSelectedTerms()
        }
    }
}
</script>
<style scoped lang="stylus">
div.inline-term
    display inline-block
</style>
