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
                <taxonomy-editor :taxonomy-url="selectedTaxonomy.links.self"
                                 :taxonomy-code="selectedTaxonomy.code">
                </taxonomy-editor>
            </q-card-section>
        </q-card>
    </div>
</div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import TaxonomyEditor from './components/TaxonomyEditor.vue'

export default @Component({
    name: 'App',
    components: {
        'taxonomy-editor': TaxonomyEditor
    }
})
class App extends Vue {
    taxonomies = []
    selectedTaxonomy = null

    mounted () {
        this.loadTaxonomies()
    }

    loadTaxonomies () {
        this.$axios.get('/api/taxonomies/').then(data => {
            this.taxonomies = data.data
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
