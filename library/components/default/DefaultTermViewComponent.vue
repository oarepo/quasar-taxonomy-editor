<template>
<span>
{{ term.title || term.slug }}
</span>
</template>
<script>
import { Vue, Component } from 'vue-property-decorator'

export default @Component({
    props: {
        taxonomyCode: String,
        term: Object
    }
})
class DefaultTermViewComponent extends Vue {
}
</script>
<style>
.tree-checkbox.disabled {
    background-color: gray;
}
</style>
