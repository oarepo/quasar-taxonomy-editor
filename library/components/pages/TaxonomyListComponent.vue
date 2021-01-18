<template>
    <div>
        <slot name="header"></slot>
        <div :class="rowClass">
            <template v-for="taxonomy in taxonomies">
            <slot name="taxonomy-card" v-bind:taxonomy="taxonomy">
                <q-card :class="cardClass" square bordered flat>
                    <slot name="taxonomy-title" v-bind:taxonomy="taxonomy">
                        <q-card-section :class="titleClass">
                            <div class="text-h4">{{ $taxonomies.titleGetter(taxonomy) }}</div>
                            <q-badge color="primary" v-if="taxonomy.descendants_count">
                                {{ $tc('taxonomy.descendantsCountNumber', taxonomy.descendants_count) }}
                            </q-badge>
                            <q-badge color="negative" v-if="taxonomy.descendants_busy_count">
                                {{ $tc('taxonomy.pendingOperationNumber', taxonomy.descendants_busy_count) }}
                            </q-badge>
                        </q-card-section>
                    </slot>
                    <slot name="taxonomy-body" v-bind:taxonomy="taxonomy">
                        <q-card-section>
                            <component :is="taxonomyViewerComponent(taxonomy)" :taxonomy="taxonomy"></component>
                        </q-card-section>
                    </slot>
                    <slot name="taxonomy-actions" v-bind:taxonomy="taxonomy">
                        <q-card-actions>
                            <q-btn flat icon="folder_open" color="primary" type="a"
                                   :to="{name: detailRouteName, params: {code: taxonomy.code}}">
                                <span class="q-pl-sm">{{ $t('taxonomy.open') }}</span>
                            </q-btn>
                            <q-space></q-space>
                        </q-card-actions>
                    </slot>
                </q-card>
            </slot>
            </template>
        </div>
        <slot name="buttons">
            <div :class="buttonsClass">
                <slot name="extra-buttons"></slot>
            </div>
        </slot>
    </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'
import DefaultTaxonomyViewComponent from '../default/DefaultTaxonomyViewComponent.vue'
import {
    QCard,
    QCardSection,
    QBadge,
    QCardActions,
    QBtn,
    QSpace
} from 'quasar'

export default @Component({
    name: 'taxonomy-list',
    props: {
        rowClass: {
            type: String,
            default: 'row q-col-gutter-sm'
        },
        cardClass: {
            type: String,
            default: 'col-12 col-md-6 col-lg-4'
        },
        titleClass: {
            type: String,
            default: 'row justify-between items-start'
        },
        buttonsClass: {
            type: String,
            default: 'q-mt-lg'
        },
        detailRouteName: {
            type: String,
            default: 'taxonomy-detail'
        }
    },
    components: {
        QCard,
        QCardSection,
        QBadge,
        QCardActions,
        QBtn,
        QSpace
    }
})
class TaxonomyListComponent extends Vue {
    taxonomies = []

    taxonomyViewerComponent (taxonomy) {
        return this.$taxonomies.taxonomyViewers[taxonomy.code] || DefaultTaxonomyViewComponent
    }

    async mounted () {
        this.taxonomies = await this.$taxonomies.loadTaxonomies()
    }
}
</script>

<style lang="sass" scoped>
</style>
