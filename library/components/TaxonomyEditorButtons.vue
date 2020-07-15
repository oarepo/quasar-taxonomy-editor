<template>
<div>
    <q-badge color="primary" size="sm" outline v-if="term.descendants_count">
        {{term.descendants_count}}
    </q-badge>
    <q-btn href="#" @click.stop="$emit('open-taxonomy', term)" flat icon="fullscreen" size="sm"
           color="primary" v-if="term.descendants_count>0"></q-btn>
    <q-btn href="#" @click.stop="$emit('edit-term', term)" flat icon="edit" size="sm"
           color="primary" v-if="permissions.includes('edit')"></q-btn>
    <q-btn href="#" @click.stop="$emit('add-child-node', term)" flat icon="playlist_add" size="sm"
           color="positive" v-if="permissions.includes('insert')"></q-btn>
    <q-btn href="#" @click.stop="$emit('remove-node', term)" flat icon="remove" size="sm"
           color="negative" v-if="permissions.includes('delete')"></q-btn>
</div>
</template>

<script>
import { Component } from 'vue-property-decorator'

export default @Component({
    props: {
        taxonomy: String,
        term: Object,
        permissions: Array[String],
        node: Object
    }
})
class TaxonomyEditorButtons {
    mounted () {
        this.term._node = this.node
    }
}
</script>

<style lang="stylus" scoped>
</style>
