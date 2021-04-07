<template>
  <q-toolbar style="margin: 4px 4px 4px 0px;">
    <q-icon class="text-primary" :name="icon" size="sm" />
    <!--<q-avatar :icon="icon" color="primary" text-color="white" size="md"/>-->
    <q-toolbar-title> {{ title }} </q-toolbar-title>
    <q-space></q-space>
    <div class="text-caption">powered by <a href="https://dashblocks.io" target="blank">dashblocks</a></div>
  </q-toolbar>
</template>

<script>
export default {
  name: 'TitleBar',
  props: {
    title: String,
    icon: String
  }
};
</script>
