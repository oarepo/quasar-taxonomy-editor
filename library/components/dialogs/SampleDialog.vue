<template>
    <q-dialog ref="dialog" @hide="onDialogHide">
        <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw; ">
            <q-card-section class="q-mt-lg">
                <q-checkbox v-model="elasticsearch">Elasticsearch-friendly serialization</q-checkbox>
                <div class="row">
                    <div class="col q-ma-md">
                        <div class="text-h6">{{ $t('taxonomy.singleSelection') }}</div>
                        <div class="q-mt-lg"></div>
                        <term-select :taxonomy-code="taxonomyCode"
                                     v-model="single"
                                     :multiple="false"
                                     :elasticsearch="elasticsearch"
                                     placeholder="Start writing or click on the icon 🡒"></term-select>
                        <div class="text-h6 q-mt-xl q-mb-md">{{ $t('taxonomy.selectedValue') }}</div>
                        <editor-taxonomy-term :taxonomy-code="taxonomyCode" :term="single"
                                       v-if="isSingleValue(single)"></editor-taxonomy-term>
                        <editor-taxonomy-term :taxonomy-code="taxonomyCode" :term="term"
                                       v-for="term in single" :key="term.slug" v-else></editor-taxonomy-term>
                    </div>
                    <q-separator vertical></q-separator>
                    <div class="col q-ma-md">
                        <div class="text-h6">{{ $t('taxonomy.multipleSelection') }}</div>
                        <div class="q-mt-lg"></div>
                        <term-select :taxonomy-code="taxonomyCode"
                                     v-model="multiple"
                                     :multiple="true"
                                     :elasticsearch="elasticsearch"
                                     placeholder="Start writing or click on the icon 🡒"></term-select>
                        <div class="text-h6 q-mt-xl q-mb-md">{{ $t('taxonomy.selectedValues') }}</div>
                        <editor-taxonomy-term :taxonomy-code="taxonomyCode" :term="term"
                                       v-for="term in multiple" :key="term.slug"
                        ></editor-taxonomy-term>
                    </div>
                </div>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-actions align="right">
                <q-btn @click="hide">{{ $t('taxonomy.close') }}</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script>
import { Component, Vue } from 'vue-property-decorator'
import {
    QDialog,
    QCard,
    QCardSection,
    QSeparator,
    QCardActions,
    QBtn,
    QCheckbox
} from 'quasar'

export default @Component({
    props: {
        taxonomyCode: String
    },
    components: {
        QDialog,
        QCard,
        QCardSection,
        QSeparator,
        QCardActions,
        QBtn,
        QCheckbox
    }
})
class SampleDialog extends Vue {
    single = null
    multiple = []
    elasticsearch = false

    show () {
        this.$refs.dialog.show()
    }

    hide () {
        this.$refs.dialog.hide()
    }

    onDialogHide () {
        this.$emit('hide')
    }

    isSingleValue (el) {
        return !Array.isArray(el)
    }
}
</script>
<style scoped lang="stylus">
div.inline-term
    display inline-block
</style>
