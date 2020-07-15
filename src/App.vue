<template>
<div id="q-app">
    <main-layout></main-layout>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import MainLayout from 'layouts/MainLayout'

export default @Component({
    name: 'App',
    components: { MainLayout }
})
class App extends Vue {
}
</script>

<style>
</style>
