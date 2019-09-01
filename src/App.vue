<template>
<div id="q-app">
    <div class="row q-pa-xl justify-center">
        <q-card class="col-6">
            <q-card-section class="row">
                <q-select :options="Object.keys(taxonomies)" :value='selectedTaxonomyCode' @input='changeTaxonomy'
                          class="col">
                </q-select>
                <q-btn flat @click="newTaxonomy">New taxonomy</q-btn>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-section v-if="selectedTaxonomy">
                <taxonomy-editor :taxonomy-url="selectedTaxonomy.links.tree"
                                 :taxonomy-code="selectedTaxonomy.code">

                    <template v-slot:buttons-middle>
                    <q-btn flat color="primary" icon="dialpad" title="test" @click="testShown = !testShown"></q-btn>
                    </template>

                </taxonomy-editor>
            </q-card-section>
        </q-card>
    </div>
    <q-dialog v-model="testShown" v-if="selectedTaxonomy">
        <q-card style="width: 700px; max-width: 80vw;">
            <q-card-section>
                <div>
                    Taxonomy term input in dialog<br>
                    <dialog-taxonomy-input label="Term(s)"
                                           v-model="selectedTaxonomyTerm"
                                           :taxonomyCode="selectedTaxonomy.code"
                                           :taxonomyUrl="selectedTaxonomy.links.tree"
                                           :rules="rules"
                    ></dialog-taxonomy-input>
                    <br>
                    Value: <span v-if="selectedTaxonomyTerm">{{ selectedTaxonomyTerm.title }}</span>
                </div>
                <q-separator class="q-my-xl"></q-separator>
                <div>
                    Multiple taxonomy input in dialog<br>
                    <dialog-taxonomy-input label="Term(s)"
                                           v-model="selectedTaxonomyTermList"
                                           :taxonomyCode="selectedTaxonomy.code"
                                           :taxonomyUrl="selectedTaxonomy.links.tree"
                                           :multiple="true"
                                           :rules="arrayRules"
                    ></dialog-taxonomy-input>
                    <br>
                    Value:
                    <div v-for="elem in selectedTaxonomyTermList" :key="elem.links.self">
                        {{ elem.title }}
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import TaxonomyEditor from './components/TaxonomyEditor.vue'
import DialogTaxonomyInput from './components/DialogTaxonomyInput.vue'
import TestViewComponent from './TestViewComponent.vue'
import TestEditComponent from './TestEditComponent.vue'

export default @Component({
    name: 'App',
    components: {
        'taxonomy-editor': TaxonomyEditor,
        'dialog-taxonomy-input': DialogTaxonomyInput
    }
})
class App extends Vue {
    taxonomies = []
    selectedTaxonomy = null
    testShown = false
    selectedTaxonomyTerm = null
    selectedTaxonomyTermList = []
    selectedTaxonomyCode = null

    rules = [
        x => {
            console.log('Validating', x)
            return !!x || 'This field is required'
        }
    ]

    arrayRules = [
        x => !!x.length || 'This field is required'
    ]

    mounted () {
        this.$taxonomies.loadTaxonomies('/api/taxonomies').then(taxonomies => {
            this.taxonomies = taxonomies
            if (this.taxonomies) {
                const firstCode = Object.keys(this.taxonomies)[0]
                this.$taxonomies.addViewer(firstCode, TestViewComponent)
                this.$taxonomies.addEditor(firstCode, TestEditComponent)
                this.changeTaxonomy(firstCode)
            }
        })
    }

    newTaxonomy () {
        const nt = prompt('New taxonomy code')
        if (nt) {
            this.$axios.post('/api/taxonomies/', {
                code: nt,
                extra_data: {}
            }).then(data => {
                this.loadTaxonomies()
            })
        }
    }

    changeTaxonomy (val) {
        this.selectedTaxonomyCode = val
        if (val) {
            this.selectedTaxonomy = null
            this.$nextTick(() => {
                this.selectedTaxonomy = this.taxonomies[val]
            })
        }
    }
}
</script>

<style>
</style>
