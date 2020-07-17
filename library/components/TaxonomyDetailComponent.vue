<template>
<div v-if="taxonomy">
    <slot name="taxonomy-title" v-bind:taxonomy="taxonomy">
        <div :class="titleClass">{{$taxonomies.titleGetter(taxonomy)}}</div>
    </slot>
    <taxonomy-editor :taxonomy-code="code" :startExpanded="true">
        <template v-slot:buttons-middle>
        <q-btn flat color="primary" icon="dialpad" title="test" @click="showTest()"></q-btn>
        </template>
    </taxonomy-editor>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import DialogTaxonomyInputDialog from './DialogTaxonomyInputDialog'

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
            component: DialogTaxonomyInputDialog,
            taxonomyCode: this.code,
            multiple: true
        })
    }
}
</script>

<style lang="sass" scoped>
</style>
