<template>
<q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin full-width">
        <q-card-section>
            <div class="text-h6">Move term</div>
        </q-card-section>
        <q-card-section>
            <q-chip outline color="primary" class="q-pa-md">
                <taxonomy-term :term="term" :taxonomy-code="taxonomyCode"
                               usage="inplace"></taxonomy-term>
            </q-chip>
        </q-card-section>
        <q-card-section>
            <div class="text-h6 q-pt-md">Into</div>
        </q-card-section>
        <q-card-section>
            <term-select :taxonomy-code="taxonomyCode" v-model="selected" ref="select"
                         selector-title="Select destination"
            ></term-select>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-lg">
            <q-btn flat label="Cancel" @click="onCancelClick"/>
            <q-btn color="primary" label="Do it !" @click="onOKClick" focused/>
        </q-card-actions>
    </q-card>
</q-dialog>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import TaxonomyTree from 'app/library/components/TaxonomyTree'

export default @Component({
    props: {
        taxonomyCode: String,
        term: Object,
        moveOperation: Function
    },
    components: {
        TaxonomyTree
    }
})
class MoveDialog extends Vue {
    selected = null

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
        if (!this.selected) {
            this.$refs.select.openSelector()
            return
        }
        this.$q.dialog({
            title: 'Moving taxonomy term',
            message: 'Do you really want to move the taxonomy term to a new parent? ' +
                'This action can not be undone and may take a lot of time!',
            cancel: true,
            focus: 'cancel',
            persistent: true
        }).onOk(() => {
            this.$taxonomies.move({ term: this.term, destination: this.selected }).then(() => {
                this.$emit('ok')
                this.hide()
            }).catch((exception) => {
                if (exception.response.status === 412) {
                    this.$q.notify({
                        message: 'This term is locked, please wait until the locking process finishes.',
                        color: 'red',
                        position: 'center',
                        icon: 'block'
                    })
                } else {
                    this.$q.notify({
                        message: exception.message,
                        color: 'red',
                        position: 'center',
                        icon: 'block'
                    })
                }
            })
        })
    }

    onCancelClick () {
        this.hide()
    }
}
</script>
<style>

</style>
