<template>
<component :is="termComponent" :term="term" :taxonomy-code="taxonomyCode" v-if="term"></component>
<div v-else>
    <slot name="empty">
        <span></span>
    </slot>
</div>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'

export default @Component({
    name: 'editor-taxonomy-term',
    props: {
        term: Object,
        taxonomyCode: String,
        usage: {
            type: String,
            default: 'view'
        }
    }
})
class TermComponent extends Vue {
    get termComponent () {
        return this.$taxonomies.getTermViewComponent({
            taxonomy: this.taxonomyCode,
            term: this.term,
            usage: this.usage
        })
    }
}
</script>
<style>

</style>
