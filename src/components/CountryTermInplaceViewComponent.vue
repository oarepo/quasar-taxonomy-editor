<template>
<div>
    <div v-if="term.CountryName" :title="term.CapitalName">
        {{term.CountryName}}
    </div>
    <div v-else-if="term.title">{{term.title}}</div>
    <div v-else>{{term.slug}}</div>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

export default @Component({
    props: {
        term: Object
    }
})
class CountryTermInplaceViewComponent extends Vue {
}
</script>

<style>
</style>
