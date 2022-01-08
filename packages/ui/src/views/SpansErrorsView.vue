// Sample of configuring perspective views // https://bl.ocks.org/texodus/803de90736a3641ad91c5c7a1b49d0a7
<template>
  <div class="h-full">
    <div @click="onSave">Save</div>
    <perspective-viewer style="width: 100%; height: 100%; resize: vertical" class="perspective-viewer-material" />
  </div>
</template>
<script lang="js">
  import { defineComponent } from 'vue';
  import { mapState, mapActions } from 'vuex';
  import { perspectiveTables } from '@/store/perspectivetables';

  // w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start

  const viewerConfig = {"plugin":"Datagrid","plugin_config":{},"settings":true,"row_pivots":[],"column_pivots":[],"columns":["spanId","traceId","parentSpanId","service","kind","category","success","name","startTime","endTime","duration","http.url"],"filter":[["success","==",false]],"sort":[],"expressions":[],"aggregates":{}};

  export default defineComponent({
    components: {},
    data() {
      return {
        schema: Object.freeze({}),
        idx: 0,
        testSpanId: '',
      };
    },
    computed: {
      ...mapState({
        refresh: (state) => state.layout.refresh,
      }),
      currentRouteName() {
        return this.$route.name;
      },
    },
    watch: {
      refresh: {
        handler: async function () {
          this.handleLoad();
        },
      },
    },
    async mounted() {
      await this.initialize();
    },
    methods: {
      ...mapActions({
        getData: 'data/getData',
        setProgress: 'layout/setProgress',
      }),
      async onSave(){
        const el = document.getElementsByTagName('perspective-viewer')[0];
        const config = await el.save();
        console.log(`Viewer config: ${JSON.stringify(config)}`);
      },
      async initialize() {
        const el = document.getElementsByTagName('perspective-viewer')[0];
        const spansTable = await perspectiveTables.getTable('spans');
        el.load(spansTable);
        //el.toggleConfig();
        el.restore(viewerConfig);
      }
    },
  });
</script>
