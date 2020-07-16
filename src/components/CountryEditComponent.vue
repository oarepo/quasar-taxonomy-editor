<template>
<q-form ref="form">
    <div class="row q-col-gutter-md q-mb-md">
        <q-input label="Country Code *" focused v-model="model.CountryCode" ref="CountryCode" class="col-4"
                 :disable="countryCodeDisabled" :rules="[val => !!val || 'Field is required']"></q-input>
        <q-input label="Country Name *" focused v-model="model.CountryName" ref="CountryName"
                 class="col-8" :rules="[val => !!val || 'Field is required']"></q-input>
    </div>
    <q-input label="Capital Name" focused v-model="model.CapitalName" ref="CapitalName"></q-input>
    <div class="row q-col-gutter-md">
        <q-input label="Capital Latitude" focused v-model="model.CapitalLatitude" ref="CapitalLatitude"
                 class="col-6"></q-input>
        <q-input label="Capital Longitude" focused v-model="model.CapitalLongitude" ref="CapitalLongitude"
                 class="col-6"></q-input>
    </div>
    <q-item-label class="q-pt-md q-pb-sm text-grey">Comments</q-item-label>
    <q-editor v-model="model.Comment" ref="Comment"></q-editor>
</q-form>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'

export default @Component({
    props: {
        initial: Object
    }
})
class CountryEditComponent extends Vue {
    model = {
        Comment: ''
    }

    countryCodeDisabled = true

    mounted () {
        if (this.initial) {
            this.model = Object.assign({}, this.model, this.initial)
            setTimeout(() => {
                this.$refs.Comment.focus()
            }, 0)
        } else {
            this.countryCodeDisabled = false
            setTimeout(() => {
                this.$refs.CountryCode.focus()
            }, 0)
        }
    }

    async validate () {
        return this.$refs.form.validate(true)
    }

    get slug () {
        return this.model.CountryCode
    }
}
</script>
<style>

</style>
