<template>
    <q-dialog ref="dialog" @hide="onDialogHide">
        <q-card class="q-dialog-plugin full-width">
            <q-card-section>
                <div class="text-h6">{{ $t('taxonomy.moveTerm') }}</div>
            </q-card-section>
            <q-card-section>
                <q-chip outline color="primary" class="q-pa-md">
                    <editor-taxonomy-term :term="term" :taxonomy-code="taxonomyCode"
                                   usage="inplace"></editor-taxonomy-term>
                </q-chip>
            </q-card-section>
            <q-card-section>
                <div class="text-h6 q-pt-md">{{ $t('taxonomy.moveInto') }}</div>
            </q-card-section>
            <q-card-section>
                <term-select :taxonomy-code="taxonomyCode" v-model="selected" ref="select"
                             :selector-title="$t('taxonomy.selectDestination')"
                ></term-select>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-lg">
                <q-btn flat :label="$t('taxonomy.cancel')" @click="onCancelClick"/>
                <q-btn color="primary" :label="$t('taxonomy.doit')" @click="onOKClick" focused/>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import TaxonomyTree from '../TaxonomyTree.vue'
import {
    QDialog,
    QCard,
    QCardSection,
    QChip,
    QCardActions,
    QBtn
} from 'quasar'

export default @Component({
    props: {
        taxonomyCode: String,
        term: Object,
        moveOperation: Function
    },
    components: {
        TaxonomyTree,
        QDialog,
        QCard,
        QCardSection,
        QChip,
        QCardActions,
        QBtn
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
            title: this.$t('taxonomy.moveDialog.title'),
            message: this.$t('taxonomy.moveDialog.message'),
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
                        message: this.$t('taxonomy.moveDialog.locked'),
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
