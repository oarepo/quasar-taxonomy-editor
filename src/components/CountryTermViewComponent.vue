<template>
<div>
    <div v-if="term.CountryName">
        <span style="color: grey; width: 50px; display: inline-block;" class="q-pr-md">{{term.CountryCode}}</span>
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
class CountryTermViewComponent extends Vue {
}
</script>

<style>
</style>
