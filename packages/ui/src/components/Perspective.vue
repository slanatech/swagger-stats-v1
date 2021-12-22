/* Perspective * Perspective viewer: https://perspective.finos.org/ */
<template>
  <perspective-viewer style="width: 100%; height: 100%; resize: vertical" class="perspective-viewer-material" />
</template>
<script>
  //import '@finos/perspective-viewer/themes/all-themes.css';
  //import reportdata from "@/node_report.json"
  //import "@finos/perspective-viewer/themes/material.dark.css";
  //import "@finos/perspective-viewer/themes/all-themes.css";
  /*
  import perspective from "@finos/perspective"
  import "@finos/perspective-viewer";
  import "@finos/perspective-viewer-datagrid";
  import "@finos/perspective-viewer-d3fc";
  import "@finos/perspective-viewer/dist/umd/material-dense.css";
  */

  import "@finos/perspective-viewer/dist/umd/material-dense.css";

  // TODO Try composition API
  export default {
    name: 'Perspective',
    components: {},
    data() {
      return {
        table: null,
      };
    },
    props: {
      data: {
        type: Object,
        default: null,
      },
      schema: {
        type: Object,
        default: null,
      },
    },
    watch: {
      data: {
        handler: function () {
          console.log(`WATCH: data changed!`);
          this.setData();
        },
      },
    },
    async mounted() {
      // The `<perspective-viewer>` HTML element exposes the viewer API
      // below does not work in mounted
      const worker = perspective.worker();
      const pdata = {
        Sales: [500, 1000, 1500],
        Profit: [100.25, 200.5, 300.75],
      };
      this.table = await worker.table(pdata); //(this.schema); // Will fail here is schema is observed (Proxy)
      const el = document.getElementsByTagName('perspective-viewer')[0];
      el.load(this.table);
      el.toggleConfig();
      //this.setData();
    },
    methods: {
      async setData() {
        if (this.table && this.data && Array.isArray(this.data)) {
          // Table may still be not initialized when we here - async worker.table in mount
          this.table.replace(this.data);
        }
      },
    },
  };
</script>
