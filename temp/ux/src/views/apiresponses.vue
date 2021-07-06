<template>
  <q-page class="sws-page-padding">
    <title-bar title="API Responses" icon="pie_chart"></title-bar>
    <db-dashboard v-if="ready" :dbspec="dbspec" :dbdata="dbdata" :dark="dark"> </db-dashboard>
  </q-page>
</template>

<script>
import { DbData } from 'dashblocks';
import TitleBar from '@/components/titlebar.vue';
import statsContainer from '@/store/statscontainer';
import { swsdashboard } from '../mixins/swsdashboard';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'ApiResponses',
  mixins: [swsdashboard],
  components: {
    TitleBar
  },
  data() {
    return {
      isDark: false,
      dbdata: new DbData(),
      dbspec: {
        layout: {
          type: 'grid',
          size: 12
        },
        colorScheme: 'default',
        widgets: []
      },
      ready: false
    };
  },
  computed: {
    ...mapState({
      refreshTrigger: state => state.refreshTrigger,
      statsUpdated: state => state.stats.updated
    })
  },
  watch: {
    refreshTrigger: {
      handler: function() {
        // TODO Enable
        this.getStats({ fields: ['apistats'], method: this.apiOpMethod, path: this.apiOpPath });
      }
    },
    statsUpdated: {
      handler: function() {
        this.updateStats();
      }
    }
  },
  mounted() {
    this.dbspec.colorScheme = this.dashboardColorScheme;
    this.getStats({ fields: ['apistats'], method: this.apiOpMethod, path: this.apiOpPath });
    this.ready = true;
  },
  methods: {
    ...mapActions({
      getStats: 'stats/getStats' // map `this.getStats()` to `... dispatch('getStats')`
    }),
    updateStats: function() {
      // Generate dashboard dynamically and set data
      let apiOps = statsContainer.getApiStatsArray();
      let dbWidgets = [];
      let dbWdigetsData = [];
      let idx = 0;
      for (let apiOp of apiOps) {
        let wid = `w${idx++}`;
        let wdef = {
          id: wid,
          type: 'DbChartjsDoughnut',
          cspan: 3,
          height: 220,
          properties: {
            options: {
              title: { display: true, text: `${apiOp.method} ${apiOp.path}`, position: 'top' },
              legend: { position: 'right' }
            }
          }
        };
        dbWidgets.push(wdef);
        let wData = { labels: ['2XX', '3XX', '4XX', '5XX'], datasets: [{ data: [] }] };
        wData.datasets[0].data.push(apiOp.success);
        wData.datasets[0].data.push(apiOp.redirect);
        wData.datasets[0].data.push(apiOp.client_error);
        wData.datasets[0].data.push(apiOp.server_error);
        this.dbdata.setWData(wid, { data: wData });
      }
      this.dbspec.widgets = dbWidgets;
    }
  }
};
</script>
