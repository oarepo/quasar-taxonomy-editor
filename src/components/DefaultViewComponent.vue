<template>
<span>
{{ term.title }}
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
class DefaultViewComponent extends Vue {
}
</script>
<style>

</style>
