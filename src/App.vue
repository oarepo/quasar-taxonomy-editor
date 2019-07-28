<template>
<div id="q-app">
    <div class="row q-pa-xl justify-center">
        <q-card class="col-6">
            <q-card-section class="row">
                <q-select :options="taxonomies" v-model='selectedTaxonomy' class="col" option-label="code">
                    <!--                    <template v-slot:selected>-->
                    <!--                        {{ selectedTaxonomy.code }}-->
                    <!--                    </template>-->
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

    mounted () {
        this.loadTaxonomies()
    }

    loadTaxonomies () {
        this.$axios.get('/api/taxonomies/').then(data => {
            this.taxonomies = data.data
            if (this.taxonomies.length > 0) {
                this.selectedTaxonomy = this.taxonomies[0]
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
}
</script>

<style>
</style>
