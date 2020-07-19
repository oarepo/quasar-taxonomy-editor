const routes = [
    {
        path: '/',
        component: () => import('app/library/components/pages/TaxonomyListComponent')
    },
    {
        path: '/taxonomies/:code',
        name: 'taxonomy-detail',
        component: () => import('app/library/components/pages/TaxonomyDetailComponent'),
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
