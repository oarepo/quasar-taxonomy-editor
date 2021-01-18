<template>
    <q-dialog ref="dialog" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <component :is="editor" :initial="initial" ref="editor"></component>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="Cancel" @click="onCancelClick"/>
                <q-btn flat color="primary" label="Save" @click="onOKClick" focused/>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import { Vue, Component } from 'vue-property-decorator'
import {
    QDialog,
    QCard,
    QCardSection,
    QCardActions,
    QBtn
} from 'quasar'

export default @Component({
    props: {
        initial: Object,
        saveOperation: Function,
        editor: [Object, Function]
    },
    components: {
        QDialog,
        QCard,
        QCardSection,
        QCardActions,
        QBtn
    }
})
class EditDialog extends Vue {
    show () {
        this.$refs.dialog.show()
    }

    hide () {
        this.$refs.dialog.hide()
    }

    onDialogHide () {
        this.$emit('hide')
    }

    onOKClick () {
        this.$refs.editor.validate().then(outcome => {
            if (!outcome) {
                return
            }
            this.saveOperation({ model: this.$refs.editor.model, slug: this.$refs.editor.slug }).then((result) => {
                this.$emit('ok', result)
                this.hide()
            }).catch(err => {
                console.error(err)
                if (this.$refs.editor.error) {
                    this.$refs.editor.error(err)
                } else {
                    if (err.response && err.response.data) {
                        this.showError(err.response.data)
                    } else if (err.message) {
                        this.showError(err.message)
                    }
                }
            })
        })
    }

    showError (msg) {
        this.$q.dialog({
            parent: this,
            message: msg,
            html: true
        })
    }

    onCancelClick () {
        this.hide()
    }
}
</script>
