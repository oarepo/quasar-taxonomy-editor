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
                        {{ $t('taxonomy.noResults') }}
                    </div>
                    <div v-else>
                        {{ $t('taxonomy.typeAFewLetters') }}
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
                <editor-taxonomy-term :term="opt" :taxonomy-code="taxonomyCode"></editor-taxonomy-term>
            </q-item>
            </template>

            <template v-slot:selected-item="{opt, index, removeAtIndex}">
            <q-chip removable @remove="removeAtIndex(index)" v-if="multiple" color="primary" outline class="q-pa-md">
                <editor-taxonomy-term :term="opt" :taxonomy-code="taxonomyCode" usage="inplace"></editor-taxonomy-term>
            </q-chip>
            <q-chip color="primary" outline class="q-pa-md" v-else-if="opt && (!Array.isArray(opt) || opt.length>0)">
                <editor-taxonomy-term :term="opt" :taxonomy-code="taxonomyCode" usage="inplace"
                               v-if="!Array.isArray(opt)"></editor-taxonomy-term>
                <editor-taxonomy-term :term="optp" v-for="(optp, idx) in opt" :key="idx" :taxonomy-code="taxonomyCode"
                               usage="inplace" v-else></editor-taxonomy-term>
            </q-chip>
            </template>
        </q-select>
    </div>
</template>

<script>
import { Vue, Component, Watch } from 'vue-property-decorator'
import DialogTaxonomyInputDialog from './DialogTaxonomyInputDialog.vue'
import { copyValue, termOrArrayChanged } from '../../utils'
import { QSelect, QBtn, QIcon, QChip, QItem, QItemSection } from 'quasar'

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
        selectorTitle: String,
        elasticsearch: Boolean
    },
    components: {
        QSelect,
        QBtn,
        QItem,
        QItemSection,
        QChip,
        QIcon
    }
})
class TermSelect extends Vue {
    model = null
    options = []
    searchValue = null

    get emptyModel () {
        return !this.model || (Array.isArray(this.model) && !this.model.length)
    }

    get arrayValue () {
        if (!this.value) {
            return []
        }
        if (Array.isArray(this.value)) {
            return this.value
        }
        return [this.value]
    }

    get leafValue () {
        return (this.arrayValue || []).filter(x => x.is_ancestor !== true)
    }

    @Watch('leafValue')
    valueChanged () {
        if (termOrArrayChanged(this.model, this.leafValue)) {
            this.model = copyValue(this.leafValue)
        }
    }

    mounted () {
        if (this.value) {
            this.valueChanged()
        }
    }

    @Watch('model')
    async modelChanged () {
        if (termOrArrayChanged(this.model, this.leafValue)) {
            if (this.elasticsearch) {
                this.$emit('input', await this.convertToElasticsearch(this.model))
            } else {
                this.$emit('input', this.model)
            }
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

    async convertToElasticsearch (model) {
        if (!model) {
            return []
        }
        if (!this.multiple) {
            model = [model]
        }
        // convert each value to array
        const modelBySelf = {}
        for (const m of model) {
            const loadedTerm = await this.$taxonomies.loadTaxonomyTermElasticsearch(m.links.self)
            loadedTerm.forEach(x => {
                modelBySelf[x.links.self] = x
            })
        }
        return [...Object.values(modelBySelf)]
    }
}
</script>
<style>

</style>
