<template>
<div>
    <q-dialog ref="dialog" @hide="onDialogHide" class="taxonomy">
        <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw; ">
            <q-card-section v-if="title">
                <div class="text-h6">
                    {{ title }}
                </div>
            </q-card-section>
            <q-card-section class="q-mt-lg">
                <taxonomy-tree :taxonomy-code="taxonomyCode" :start-expanded="true" :tree-options="opts" ref="tree"
                               :value="selected" @input="treeSelected" :multiple="multiple" :initial-size="10">
                </taxonomy-tree>
            </q-card-section>
            <q-card-section v-if="multiple">
                <div class="row items-end q-gutter-md">
                    <q-field class="col" label="Selected" stack-label>
                        <template v-slot:control>
                        <div class="row items-end q-gutter-sm">
                            <q-chip removable v-for="term in selected" :key="term.slug" color="primary" outline
                                    @remove="valueUnselected(term, true)">
                                <taxonomy-term :term="term" :taxonomy-code="taxonomyCode"
                                               usage="inplace"></taxonomy-term>
                            </q-chip>
                        </div>
                        </template>
                    </q-field>
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn @click="hide" flat color="grey">{{$t('taxonomy.cancel')}}</q-btn>
                <q-btn @click="onOKClick" flat color="positive" icon="done" v-if="multiple"><span
                    class="q-pl-sm">{{$t('taxonomy.ok')}}</span>
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</div>
</template>
<script>
import { Component, Vue } from 'vue-property-decorator'
import TaxonomyTree from '../TaxonomyTree.vue'

export default @Component({
    props: {
        taxonomyCode: String,
        value: [Object, Array],
        multiple: Boolean,
        title: String
    },
    components: {
        TaxonomyTree
    }
})
class DialogTaxonomyInputDialog extends Vue {
    selected = []

    get opts () {
        return {
            checkbox: true,
            autoCheckChildren: false
        }
    }

    treeSelected (value) {
        if (this.multiple) {
            this.selected = value
        } else if (value.length) {
            this.$emit('ok', value[0])
            this.hide()
        }
    }

    show () {
        if (this.multiple) {
            this.selected = this.value || []
        } else if (this.value) {
            this.selected = this.value
        }
        this.$refs.dialog.show()
    }

    hide () {
        this.$refs.dialog.hide()
    }

    onDialogHide () {
        this.$emit('hide')
    }

    onOKClick () {
        this.$emit('ok', this.selected)
        this.hide()
    }

    onCancelClick () {
        this.hide()
    }
}
</script>
