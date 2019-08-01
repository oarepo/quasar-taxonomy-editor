<template>
<span>Test view component - {{ term.title }}</span>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

export default @Component({
    props: {
        'term': Object
    }
})
class TestViewComponent extends Vue {
}
</script>

<style>
</style>
