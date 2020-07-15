const routes = [
    {
        path: '/',
        component: () => import('app/library/components/TaxonomyListComponent.vue')
    },
    {
        path: '/taxonomies/:code',
        name: 'taxonomy-detail',
        component: () => import('app/library/components/TaxonomyDetailComponent.vue'),
        props: true
    },

    // Always leave this as last one,
    // but you can also remove it
    {
        path: '*',
        component: () => import('pages/Error404.vue')
    }
]

export default routes
