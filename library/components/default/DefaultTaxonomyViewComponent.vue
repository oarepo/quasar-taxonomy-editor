<template>
<div>
    <div v-if="taxonomy.description">
        {{ taxonomy.description }}
    </div>
</div>
</template>
<script>
import { Vue, Component } from 'vue-property-decorator'

export default @Component({
    props: {
        taxonomy: Object
    }
})
class DefaultTaxonomyViewComponent extends Vue {
}
</script>
<style>
</style>
