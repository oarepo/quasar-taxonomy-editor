<template>
<q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
        <q-card-section>
            <q-input label="Term name" focused v-model="title" ref="title"></q-input>
            <q-item-label class="q-pt-md q-pb-sm text-grey">Description</q-item-label>
            <q-editor v-model="description"></q-editor>
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
        term: Object
    }
})
class ContinentEditComponent extends Vue {
    title = ''
    description = ''

    show () {
        console.log('Term to edit:', this.term)
        if (this.term && this.term.title) {
            this.title = this.term.title
        }
        if (this.term && this.term.description) {
            this.description = this.term.description
        }
        this.$refs.dialog.show()
        setTimeout(() => {
            this.$refs.title.focus()
        }, 0)
    }

    hide () {
        this.$refs.dialog.hide()
    }

    onDialogHide () {
        this.$emit('hide')
    }

    onOKClick () {
        this.$emit('ok', {
            ...(this.term || {}),
            title: this.title,
            description: this.description
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
