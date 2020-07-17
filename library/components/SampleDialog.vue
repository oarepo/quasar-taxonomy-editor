<template>
<q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 700px; max-width: 80vw; ">
        <q-card-section class="q-mt-lg">
            <div class="row">
                <div class="col q-ma-md">
                    <div class="text-h6">Single selection</div>
                    <q-separator></q-separator>
                    <term-select :taxonomy-code="taxonomyCode" v-model="single" :multiple="false"></term-select>
                    <div class="text-h6 q-mt-xl q-mb-md">Selected value:</div>
                    <taxonomy-term :taxonomy-code="taxonomyCode" :term="single" v-if="single"></taxonomy-term>
                </div>
                <q-separator vertical></q-separator>
                <div class="col q-ma-md">
                    <div class="text-h6">Multiple selection</div>
                    <q-separator></q-separator>
                    <term-select :taxonomy-code="taxonomyCode" v-model="multiple" :multiple="true"></term-select>
                    <div class="text-h6 q-mt-xl q-mb-md">Selected value(s):</div>
                    <taxonomy-term :taxonomy-code="taxonomyCode" :term="term"
                                       v-for="term in multiple" :key="term.slug"></taxonomy-term>
                </div>
            </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-actions align="right">
            <q-btn @click="hide">Close</q-btn>
        </q-card-actions>
    </q-card>
</q-dialog>
</template>
<script>
import { Component, Vue } from 'vue-property-decorator'

export default @Component({
    props: {
        taxonomyCode: String
    }
})
class SampleDialog extends Vue {
    single = null
    multiple = []

    show () {
        this.$refs.dialog.show()
    }

    hide () {
        this.$refs.dialog.hide()
    }

    onDialogHide () {
        this.$emit('hide')
    }
}
</script>
<style scoped lang="stylus">
div.inline-term
    display inline-block
</style>
