<template>
<div class="row full-height">
    <div class="col-12 col-md-8 col-lg-6 offset-md-2 offset-lg-3">
        <q-layout view="HHH lpR fFf">

            <q-header bordered class="bg-primary text-white row">
                <q-toolbar class="col-12 col-md-8 col-lg-6 offset-md-2 offset-lg-3">
                    <q-toolbar-title @click="$router.push('/')" class="cursor-pointer">
                        <q-avatar>
                            <q-icon name="apps"></q-icon>
                        </q-avatar>
                        {{ $t('taxonomy.layoutDemo') }}
                    </q-toolbar-title>
                </q-toolbar>
            </q-header>

            <q-page-container>
                <q-page class="q-ma-lg">
                    <router-view/>
                </q-page>
            </q-page-container>

        </q-layout>
    </div>
</div>
</template>

<script>
export default {
    name: 'MainLayout'
}
</script>
