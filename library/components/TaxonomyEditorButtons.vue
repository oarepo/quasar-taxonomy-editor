<template>
<div>
    <span v-if="permissions.includes('delete')">
        <q-btn @click.stop="$emit('add-child-node', {term,node})"
               flat icon="playlist_add" size="sm"
               title="Add child term"
               color="positive" v-if="permissions.includes('insert')" dense class="q-mr-sm"></q-btn>
        <q-btn @click.stop="$emit('edit-term', {term,node})"
               flat icon="edit" size="sm"
               title="Edit term"
               color="primary" v-if="permissions.includes('edit')" dense class="q-mr-sm"></q-btn>
        <q-btn @click.stop="$emit('remove-node', {term,node})"
               flat icon="remove" size="sm"
               title="Remove term"
               color="negative" v-if="permissions.includes('delete')" dense class="q-mr-sm"></q-btn>
    </span>
    <span v-else>
        <q-btn @click.stop="$emit('edit-term', {term,node})"
               flat icon="edit" size="sm"
               title="Edit term"
               color="primary" v-if="permissions.includes('edit')" dense class="q-mr-sm"></q-btn>
        <q-btn @click.stop="$emit('add-child-node', {term,node})"
               flat icon="playlist_add" size="sm"
               title="Remove term"
               color="positive" v-if="permissions.includes('insert')" dense class="q-mr-sm"></q-btn>
    </span>
    <q-btn @click.stop="$emit('move-term', {term,node})"
           flat icon="swap_vert" size="sm"
           title="Move term"
           color="primary" v-if="permissions.includes('move')" dense class="q-mr-sm">
    </q-btn>
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
}
</script>

<style lang="stylus" scoped>
</style>
