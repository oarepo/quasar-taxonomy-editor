<template>
<div v-if="taxonomy">
    <slot name="taxonomy-title" v-bind:taxonomy="taxonomy">
        <div :class="titleClass">{{$taxonomies.titleGetter(taxonomy)}}</div>
    </slot>
    <taxonomy-editor :taxonomy-code="code" :startExpanded="true">
        <template v-slot:buttons-middle>
            <q-btn flat color="primary" icon="dialpad" title="test" @click="testShown = !testShown"></q-btn>
        </template>
    </taxonomy-editor>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

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
}
</script>

<style lang="sass" scoped>
</style>
