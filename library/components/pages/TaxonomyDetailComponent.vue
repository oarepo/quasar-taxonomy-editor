<template>
<div v-if="taxonomy">
    <slot name="taxonomy-title" v-bind:taxonomy="taxonomy">
        <div :class="titleClass">{{$taxonomies.titleGetter(taxonomy)}}</div>
    </slot>
    <taxonomy-editor :taxonomy-code="code" :startExpanded="true">
        <template v-slot:menu>
        <q-item clickable v-close-popup @click="showTest">
            <q-item-section avatar>
                <q-icon name="dialpad" color="primary"></q-icon>
            </q-item-section>
            <q-item-section>
                {{$t('taxonomy.testDialog')}}
            </q-item-section>
        </q-item>
        </template>
    </taxonomy-editor>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import SampleDialog from '../dialogs/SampleDialog'

export default @Component({
    name: 'taxonomy-detail',
    props: {
        titleClass: {
            type: String,
            default: 'text-h4'
        },
        code: String
    }
})
class TaxonomyDetailComponent extends Vue {
    taxonomy = null

    async mounted () {
        this.taxonomy = await this.$taxonomies.loadTaxonomy(this.code)
    }

    showTest () {
        this.$q.dialog({
            parent: this,
            component: SampleDialog,
            taxonomyCode: this.code
        })
    }
}
</script>

<style lang="sass" scoped>
</style>
