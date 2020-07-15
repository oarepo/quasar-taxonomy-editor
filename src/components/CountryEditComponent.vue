<template>
<q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
        <q-card-section>
            <div class="row q-col-gutter-md q-mb-md">
                <q-input label="Country Code" focused v-model="model.CountryCode" ref="CountryCode" class="col-3"
                         :disable="countryCodeDisabled"></q-input>
                <q-input label="Country Name" focused v-model="model.CountryName" ref="CountryName"
                         class="col-9"></q-input>
            </div>
            <q-input label="Capital Name" focused v-model="model.CapitalName" ref="CapitalName" class="col-9"></q-input>
            <div class="row q-col-gutter-md">
                <q-input label="Capital Latitude" focused v-model="model.CapitalLatitude" ref="CapitalLatitude"
                         class="col-6"></q-input>
                <q-input label="Capital Longitude" focused v-model="model.CapitalLongitude" ref="CapitalLongitude"
                         class="col-6"></q-input>
            </div>
            <q-item-label class="q-pt-md q-pb-sm text-grey">Comments</q-item-label>
            <q-editor v-model="model.Comment" ref="Comment"></q-editor>
        </q-card-section>
        <!-- buttons example -->
        <q-card-actions align="right">
            <q-btn flat color="primary" label="OK" @click="onOKClick"/>
            <q-btn flat label="Cancel" @click="onCancelClick"/>
        </q-card-actions>
    </q-card>
</q-dialog>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'

export default @Component({
    props: {
        term: Object,
        parent: Object
    }
})
class CountryEditComponent extends Vue {
    model = {}
    countryCodeDisabled = true

    show () {
        if (this.term) {
            this.model = {
                Comment: '',
                ...(this.term || {})
            }
            setTimeout(() => {
                this.$refs.Comment.focus()
            }, 0)
        } else {
            this.model = {
                Comment: ''
            }
            this.countryCodeDisabled = false
            setTimeout(() => {
                this.$refs.CountryCode.focus()
            }, 0)
        }
        this.$refs.dialog.show()
    }

    hide () {
        this.$refs.dialog.hide()
    }

    onDialogHide () {
        this.$emit('hide')
    }

    onOKClick () {
        this.$emit('ok', {
            slug: this.model.CountryCode,
            ...(this.term || {}),
            ...this.model
        })
        this.hide()
    }

    onCancelClick () {
        this.hide()
    }
}
</script>
<style>

</style>
