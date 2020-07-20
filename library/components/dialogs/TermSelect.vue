<template>
<div>
    <q-select v-model="model"
              use-input
              :hide-selected="false"
              hide-dropdown-icon
              :clearable="!multiple"
              :multiple="multiple"
              :input-debounce="debounce"
              :label="label"
              :options="options"
              @filter="filterFn"
              @filter-abort="abortFilterFn"
              :hint="hint"
              :placeholder="emptyModel ? translatedPlaceholder: ''"
              @keydown="onKeyDown()"
              @input="clearText()"
              ref="select">
        <template v-slot:no-option>
        <q-item>
            <q-item-section class="text-grey">
                <div v-if="searchValue">
                    {{$t('taxonomy.noResults')}}
                </div>
                <div v-else>
                    {{$t('taxonomy.typeAFewLetters')}}
                </div>
            </q-item-section>
        </q-item>
        </template>

        <template v-slot:after>
        <q-btn round flat color="primary" dense @click="showTaxonomy"
               :title="$t('taxonomy.showTaxonomyTree')">
            <q-icon name="vertical_split" class="rotate-180"></q-icon>
        </q-btn>
        </template>

        <template v-slot:option="{opt, selected, focused, itemProps, itemEvents}">
        <q-item v-bind="itemProps" v-on="itemEvents">
            <taxonomy-term :term="opt" :taxonomy-code="taxonomyCode"></taxonomy-term>
        </q-item>
        </template>

        <template v-slot:selected-item="{opt, index, removeAtIndex}">
        <q-chip removable @remove="removeAtIndex(index)" v-if="multiple" color="primary" outline class="q-pa-md">
            <taxonomy-term :term="opt" :taxonomy-code="taxonomyCode" usage="inplace"></taxonomy-term>
        </q-chip>
        <q-chip color="primary" outline class="q-pa-md" v-else>
            <taxonomy-term :term="opt" :taxonomy-code="taxonomyCode" usage="inplace"></taxonomy-term>
        </q-chip>
        </template>
    </q-select>
</div>
</template>

<script>
import { Vue, Component, Watch } from 'vue-property-decorator'
import DialogTaxonomyInputDialog from './DialogTaxonomyInputDialog.vue'
import { copyValue, termOrArrayChanged } from '../../utils'

const DEFAULT = {}

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
        hint: String,
        placeholder: {
            type: [String, Object],
            default: () => DEFAULT
        },
        selectorTitle: String
    }
})
class TermSelect extends Vue {
    model = null
    options = []
    searchValue = null

    get emptyModel () {
        return !this.model || (Array.isArray(this.model) && !this.model.length)
    }

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
            title: this.selectorTitle,
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

    openSelector () {
        this.showTaxonomy()
    }

    get translatedPlaceholder () {
        if (this.placeholder !== DEFAULT) {
            return this.placeholder
        }
        return this.$t('taxonomy.startWriting')
    }
}
</script>
<style>

</style>
