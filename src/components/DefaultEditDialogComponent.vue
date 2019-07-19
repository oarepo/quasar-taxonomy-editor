<template>
<q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
        <q-card-section>
            <div class="text-h6 q-mb-lg">Adding new top-level node</div>
            <q-input label="Node name" focused v-model="title"></q-input>
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
        taxonomyNode: Object
    }
})
class DefaultEditDialogComponent extends Vue {
    title = ''

    show () {
        console.log('Node to edit:', this.taxonomyNode)
        if (this.taxonomyNode) {
            this.title = this.taxonomyNode.title._
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
            title: {
                _: this.title
            },
            // keep slug if set on taxonomyNode
            slug: (this.taxonomyNode ? this.taxonomyNode.slug : null) || this.title,
            // keep extra data if set on taxonomyNode
            extra_data: (this.taxonomyNode ? this.taxonomyNode.extra_data : null) || {}
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
