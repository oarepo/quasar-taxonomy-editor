<template>
<div>
    <q-select v-model="model"
              use-input
              :hide-selected="false"
              hide-dropdown-icon
              clearable
              :multiple="multiple"
              :input-debounce="debounce"
              :label="label"
              :options="options"
              @filter="filterFn"
              @filter-abort="abortFilterFn"
              :hint="hint"
              @keydown="onKeyDown()"
              @input="clearText()"
              ref="select">

        <template v-slot:no-option>
        <q-item>
            <q-item-section class="text-grey">
                <div v-if="searchValue">
                    No results
                </div>
                <div v-else>
                    Type a few letters or click on the tree icon on the right
                </div>
            </q-item-section>
        </q-item>
        </template>

        <template v-slot:after>
        <q-btn round flat color="primary" dense @click="showTaxonomy"
               title="list/hierarchy">
            <q-icon name="vertical_split" class="rotate-180"></q-icon>
        </q-btn>
        </template>

        <template v-slot:option="{opt, selected, focused, itemProps, itemEvents}">
        <q-item v-bind="itemProps" v-on="itemEvents">
            <taxonomy-term :term="opt" :taxonomy-code="taxonomyCode"></taxonomy-term>
        </q-item>
        </template>

        <template v-slot:selected-item="{opt, index, removeAtIndex}">
        <q-chip removable @remove="removeAtIndex(index)" v-if="multiple">
            <taxonomy-term :term="opt" :taxonomy-code="taxonomyCode" usage="inplace"></taxonomy-term>
        </q-chip>
        <taxonomy-term :term="opt" :taxonomy-code="taxonomyCode" usage="inplace" v-else></taxonomy-term>
        </template>
    </q-select>
</div>
</template>

<script>
import { Vue, Component, Watch } from 'vue-property-decorator'
import DialogTaxonomyInputDialog from './DialogTaxonomyInputDialog'
import { copyValue, termOrArrayChanged } from 'app/library/utils'

export default @Component({
    name: 'term-select',
    props: {
        value: [Object, Array],
        taxonomyCode: String,
        multiple: {
            type: Boolean,
            default: false
        },
        debounce: {
            type: Number,
            default: 100
        },
        label: String,
        hint: String
    }
})
class TermSelect extends Vue {
    model = null
    options = []
    searchValue = null

    @Watch('value')
    valueChanged () {
        if (termOrArrayChanged(this.model, this.value)) {
            this.model = copyValue(this.value)
        }
    }

    @Watch('model')
    modelChanged () {
        if (termOrArrayChanged(this.model, this.value)) {
            this.$emit('input', this.model)
        }
    }

    filterFn (val, update, abort) {
        if (val.length < 2) {
            abort()
            return
        }

        this.searchValue = val

        this.$taxonomies.suggest({
            code: this.taxonomyCode,
            filter: this.searchValue
        }).then((terms) => {
            return update(() => {
                this.options = terms
            })
        })
    }

    abortFilterFn () {
    }

    showTaxonomy () {
        this.$q.dialog({
            parent: this,
            component: DialogTaxonomyInputDialog,
            taxonomyCode: this.taxonomyCode,
            value: this.model,
            multiple: this.multiple
        }).onOk((value) => {
            this.model = value
        })
    }

    onKeyDown () {
        if (!this.multiple && this.model) {
            this.model = null
        }
    }

    clearText () {
        this.$refs.select.updateInputValue('')
    }
}
</script>
<style>

</style>
