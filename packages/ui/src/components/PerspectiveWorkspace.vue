/* Perspective * Perspective workspace : https://perspective.finos.org/ */
<template>
  <perspective-workspace id="workspace" style="width: 100%; height: calc(100vh - 4rem); resize: vertical">
    <perspective-viewer table="movies" class="perspective-viewer-material"></perspective-viewer>
  </perspective-workspace>
</template>
<script>
  import '@finos/perspective-viewer/dist/umd/material-dense.css';
  import { useStore } from 'vuex';
  import { computed } from 'vue';
  import { perspectiveTables } from '@/store/perspectivetables';
  // TEMP
  import * as layoutJson from '@/data/layout_test.json';

  export default {
    props: {
      tableName: {
        type: String,
        default: 'spans',
      },
    },
    setup() {
      const store = useStore();
      console.log(`Setup: ${JSON.stringify(layoutJson)}`);
      return {
        sidebarItems: computed(() => store.state.sidebar.items),
      };
    },
    watch: {
      tableName: {
        handler: function (newTableName) {
          console.log(`WATCH tableName: new ${newTableName}`);
        },
      },
    },
    async mounted() {
      //const el = document.getElementsByTagName('perspective-viewer')[0];
      //const spansTable = await perspectiveTables.getTable('spans');
      //el.load(spansTable);
      //el.toggleConfig();
      window.workspace.tables.set('movies', perspectiveTables.getTable('spans'));
      window.workspace.restore(layoutJson);
      console.log(`Perspective Workspace mounted`);
    },
  };
</script>
