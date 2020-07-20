<template>
<q-form ref="form">
    <q-input label="Continent name" focused v-model="model.title" ref="title"></q-input>
    <q-item-label class="q-pt-md q-pb-sm text-grey">{{$t('taxonomy.description')}}</q-item-label>
    <q-editor v-model="model.description"></q-editor>
</q-form>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'

export default @Component({
    props: {
        initial: Object
    }
})
class DefaultEditDialogComponent extends Vue {
    model = {
        title: '',
        description: ''
    }

    mounted () {
        if (this.initial) {
            this.model = Object.assign({}, this.model, this.initial)
        }
        setTimeout(() => {
            this.$refs.title.focus()
        }, 0)
    }

    async validate () {
        return this.$refs.form.validate(true)
    }
}
</script>
<style>

</style>
