<template>
  <q-page class="sws-page-padding">
    <q-toolbar style="margin: 4px 4px 4px 0px;">
      <q-icon class="text-primary" name="settings_ethernet" size="sm" />
      <q-toolbar-title> {{ apiOpMethod }} {{ apiOpPath }} </q-toolbar-title>
      <q-select
        :dark="dark"
        class="col-4"
        filled
        dense
        spellcheck="false"
        v-model="selection"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="options"
        @filter="filterFn"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </q-toolbar>
    <db-dashboard v-if="ready" :dbspec="dbspec" :dbdata="dbdata" :dark="dark"> </db-dashboard>
  </q-page>
</template>

<script>
import { DbData } from 'dashblocks';
import { pathOr } from 'ramda';
import statsContainer from '@/store/statscontainer';
import { mapState, mapActions } from 'vuex';
import { swsdashboard } from '../mixins/swsdashboard';
import utils from '@/utils.js';

export default {
  name: 'ApiOperation',
  mixins: [swsdashboard],
  data() {
    return {
      timer: null,
      apiOpMethod: null,
      apiOpPath: null,
      allOptions: null,
      options: ['None'],
      selection: null,
      dbdata: new DbData(),
      dbspec: {
        layout: {
          type: 'grid',
          size: 12
        },
        colorScheme: 'default',
        // prettier-ignore
        widgets: [
          { id: 'w1', type: 'DbNumber', cspan: 2, properties: { title: 'Requests', subtitle: 'Total requests received', icon: 'fa fa-signal' } },
          { id: 'w2', type: 'DbNumber', cspan: 2, properties: {
            title: 'Apdex Score', subtitle: 'Overall Apdex Score', total: 1, trendMax: 1, format: '%.2f',
            percentRanges: [
              { value: 50, color: 'red'},
              { value: 60, color: 'orange'},
              { value: 100, color: 'green'},
            ]}
          },
          { id: 'w3', type: 'DbNumber', cspan: 2, properties: { title: 'Req Rate', subtitle: 'Requests per second', format: '%.2f', icon: 'fa fa-exchange-alt' } },
          { id: 'w4', type: 'DbNumber', cspan: 2, properties: { title: 'Err Rate', subtitle: 'Errors per second', format: '%.2f', icon: 'fa fa-exclamation' } },
          { id: 'w5', type: 'DbNumber', cspan: 2, properties: { title: 'Avg HT', subtitle: 'Average Handle Time', format: '%.0f %s', qualifier: 'ms' } },
          { id: 'w6', type: 'DbNumber', cspan: 2, properties: { title: 'Avg Req Payload', subtitle: 'Avg Req Content Len', format: '%.2f %s', icon: 'fa fa-sd-card' } },

          { id: 'w7', type: 'DbNumber', cspan: 2, properties: { title: 'Errors', subtitle: 'Total Error Responses' } },
          { id: 'w8', type: 'DbNumber', cspan: 2, properties: {
            title: '2XX', subtitle: 'Success Responses',
            percentRanges: [
              { value: 50, color: 'red'},
              { value: 70, color: 'orange'},
              { value: 100, color: 'green'}
            ]}
          },
          { id: 'w9', type: 'DbNumber', cspan: 2, properties: { title: '3XX', subtitle: 'Redirect Responses' } },
          { id: 'w10', type: 'DbNumber', cspan: 2, properties: { title: '4XX', subtitle: 'Client Error Responses' } },
          { id: 'w11', type: 'DbNumber', cspan: 2, properties: { title: '5XX', subtitle: 'Server Error Responses' } },
          { id: 'w12', type: 'DbNumber', cspan: 2, properties: { title: 'Avg Res Payload', subtitle: 'Avg Res Content Len', format: '%.2f %s', icon: 'fa fa-sd-card' } },
          // TODO
          {
            id: 'w25',
            type: 'DbChartjsBar',
            cspan: 4,
            height: 300,
            properties: {
              options: {
                title: { display: true, text: 'Handle Time Histogram', position: 'top'},
                legend: { display: false },
                plugins: { labels: {render: ()=>{}}},
                scales: { xAxes: [{ ticks: {autoSkip: false,maxRotation: 50,minRotation: 50}}]}
              }
            }
          },
          {
            id: 'w26',
            type: 'DbChartjsBar',
            cspan: 4,
            height: 300,
            properties: {
              options: {
                title: { display: true, text: 'Request Size Histogram', position: 'top'},
                legend: { display: false },
                plugins: { labels: {render: ()=>{}}},
                scales: { xAxes: [{ ticks: {autoSkip: false,maxRotation: 50,minRotation: 50}}]}
              }
            }
          },
          {
            id: 'w27',
            type: 'DbChartjsBar',
            cspan: 4,
            height: 300,
            properties: {
              options: {
                title: { display: true, text: 'Response Size Histogram', position: 'top'},
                legend: { display: false },
                plugins: { labels: {render: ()=>{}}},
                scales: { xAxes: [{ ticks: {autoSkip: false,maxRotation: 50,minRotation: 50}}]}
              }
            }
          },

          {
            id: 'w28',
            type: 'DbChartjsDoughnut',
            cspan: 4,
            height: 250,
            properties: {
              options: {
                title: {display: true, text: 'Response Codes', position: 'top'},
                legend: { position: 'right' }
              }
            }
          },

          {
            id: 'w29',
            type: 'QTable',
            cspan: 8,
            height: 250,
            properties: {
              title: "Parameters",
              "hide-bottom": true,
              dense: true,
              flat: true,
              columns: [
                { name: 'name', label: 'Name', classes: 'text-bold', required: true, align: 'left',field: row => row.name,format: val => `${val}`,sortable: true },
                { name: 'in', label: 'In', required: false, align: 'left',field: row => row.in,format: val => `${val}`,sortable: true },
                { name: 'description', label: 'Description', required: false, align: 'left',field: row => row.description,format: val => `${val}`,sortable: true },
                { name: 'hits', label: 'Hits', required: false, align: 'left',field: row => row.hits, format: val => `${val}`,sortable: true },
                { name: 'misses', label: 'Misses', required: false, align: 'left',field: row => row.misses, format: val => `${val}`,sortable: true },
                { name: 'required', label: 'Required', required: false, align: 'left',field: row => row.required, format: val => `${val}`,sortable: true }
              ]
            }
          },

        ]
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
        this.getStats({ fields: ['apiop'], method: this.apiOpMethod, path: this.apiOpPath });
      }
    },
    statsUpdated: {
      handler: function() {
        this.updateStats();
      }
    },
    selection: {
      handler: function(val) {
        if (val) {
          let parts = val.split(' ');
          this.apiOpMethod = parts[0];
          this.apiOpPath = parts[1];
          this.getStats({ fields: ['apiop'], method: this.apiOpMethod, path: this.apiOpPath });
        }
      }
    }
  },
  mounted() {
    this.apiOpMethod = this.$route.query.method || null;
    this.apiOpPath = this.$route.query.path || null;
    this.initialize();
    if (this.apiOpMethod && this.apiOpPath) {
      this.getStats({ fields: ['apiop', 'apidefs'], method: this.apiOpMethod, path: this.apiOpPath });
    } else {
      this.getStats({ fields: ['apidefs'] });
    }
    this.ready = true;
  },
  methods: {
    ...mapActions({
      getStats: 'stats/getStats' // map `this.getStats()` to `... dispatch('getStats')`
    }),
    initialize: function() {
      this.dbspec.colorScheme = this.dashboardColorScheme;
      // Init dashboard data
      this.dbdata.setWData('w1', { value: 0 });
      this.dbdata.setWData('w2', { value: 0 });
      this.dbdata.setWData('w3', { value: 0 });
      this.dbdata.setWData('w4', { value: 0 });
      this.dbdata.setWData('w5', { value: 0 });
      this.dbdata.setWData('w6', { value: 0, qualifier: '' });
      this.dbdata.setWData('w7', { value: 0 });
      this.dbdata.setWData('w8', { value: 0 });
      this.dbdata.setWData('w9', { value: 0 });
      this.dbdata.setWData('w10', { value: 0 });
      this.dbdata.setWData('w11', { value: 0 });
      this.dbdata.setWData('w12', { value: 0 });

      this.dbdata.setWData('w25', { data: { labels: [], datasets: [{ data: [] }] } });
      this.dbdata.setWData('w26', { data: { labels: [], datasets: [{ data: [] }] } });
      this.dbdata.setWData('w27', { data: { labels: [], datasets: [{ data: [] }] } });
      this.dbdata.setWData('w28', { data: { labels: [], datasets: [{ data: [] }] } });

      this.dbdata.setWData('w29', { data: [] });
    },

    updateStats: function() {
      // Update selector
      let apiDefs = pathOr(null, ['apidefs'], statsContainer);
      let needStatsReload = false;
      let allOptions = [];
      if (apiDefs) {
        for (let apiPath of Object.keys(apiDefs)) {
          for (let apiMethod of Object.keys(apiDefs[apiPath])) {
            if (!this.apiOpMethod && !this.apiOpPath) {
              this.apiOpMethod = apiMethod;
              this.apiOpPath = apiPath;
              needStatsReload = true;
            }
            allOptions.push(`${apiMethod} ${apiPath}`);
          }
        }
        this.allOptions = allOptions;
      }

      if (needStatsReload) {
        this.getStats({ fields: ['apiop'], method: this.apiOpMethod, path: this.apiOpPath });
        return;
      }

      this.selection = `${this.apiOpMethod} ${this.apiOpPath}`;

      // Update dashboard
      let apiOpData = pathOr(null, ['apiop', this.apiOpPath, this.apiOpMethod], statsContainer);
      if (!apiOpData) {
        return;
      }
      let apiOpDefs = apiOpData.defs || null;
      let apiOpStats = apiOpData.stats || null;
      let apiOpDetails = apiOpData.details || null;

      let requestsTotal = pathOr(0, ['requests'], apiOpStats);
      this.dbdata.setWData('w1', { value: requestsTotal });
      this.dbdata.setWData('w2', { value: pathOr(0, ['apdex_score'], apiOpStats) });
      this.dbdata.setWData('w3', { value: pathOr(0, ['req_rate'], apiOpStats) });
      this.dbdata.setWData('w4', { value: pathOr(0, ['err_rate'], apiOpStats) });
      this.dbdata.setWData('w5', { value: pathOr(0, ['avg_time'], apiOpStats) });
      let { value, qualifier } = utils.formatBytes(pathOr(0, ['avg_req_clength'], apiOpStats), 2);
      this.dbdata.setWData('w6', { value: value, qualifier: qualifier });

      this.dbdata.setWData('w7', { value: pathOr(0, ['errors'], apiOpStats), total: requestsTotal });
      this.dbdata.setWData('w8', { value: pathOr(0, ['success'], apiOpStats), total: requestsTotal });
      this.dbdata.setWData('w9', { value: pathOr(0, ['redirect'], apiOpStats), total: requestsTotal });
      this.dbdata.setWData('w10', { value: pathOr(0, ['client_error'], apiOpStats), total: requestsTotal });
      this.dbdata.setWData('w11', { value: pathOr(0, ['server_error'], apiOpStats), total: requestsTotal });
      ({ value, qualifier } = utils.formatBytes(pathOr(0, ['avg_res_clength'], apiOpStats), 2));
      this.dbdata.setWData('w12', { value: value, qualifier: qualifier });

      this.dbdata['w25'].data.labels = utils.bucketsToLabels(pathOr([], ['duration', 'buckets'], apiOpDetails));
      this.dbdata['w25'].data.datasets[0].data = pathOr([], ['duration', 'values'], apiOpDetails);
      this.dbdata.touch('w25');

      this.dbdata['w26'].data.labels = utils.bucketsToLabels(pathOr([], ['req_size', 'buckets'], apiOpDetails));
      this.dbdata['w26'].data.datasets[0].data = pathOr([], ['req_size', 'values'], apiOpDetails);
      this.dbdata.touch('w26');

      this.dbdata['w27'].data.labels = utils.bucketsToLabels(pathOr([], ['res_size', 'buckets'], apiOpDetails));
      this.dbdata['w27'].data.datasets[0].data = pathOr([], ['res_size', 'values'], apiOpDetails);
      this.dbdata.touch('w27');

      let codes = Object.keys(pathOr({}, ['code'], apiOpDetails));
      this.dbdata['w28'].data.labels = codes;
      this.dbdata['w28'].data.datasets[0].data = codes.map(x => pathOr(0, ['code', x, 'count'], apiOpDetails));
      this.dbdata.touch('w28');

      let paramNames = Object.keys(pathOr({}, ['parameters'], apiOpDetails));
      this.dbdata['w29'].data = paramNames.map(x => pathOr(0, ['parameters', x], apiOpDetails));
      this.dbdata.touch('w29');
    },

    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.options = this.allOptions.filter(v => v.toLowerCase().indexOf(needle) > -1);
      });
    }
  }
};
</script>
