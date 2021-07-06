<template>
  <q-page class="sws-page-padding">
    <title-bar title="Summary" icon="trending_up"></title-bar>
    <db-dashboard v-if="ready" :dbspec="dbspec" :dbdata="dbdata" :dark="dark"> </db-dashboard>
  </q-page>
</template>

<script>
// Development
import { DbData } from 'dashblocks';
import TitleBar from '@/components/titlebar.vue';
import { pathOr } from 'ramda';
import statsContainer from '@/store/statscontainer';
import { mapState, mapActions } from 'vuex';
import { swsdashboard } from '../mixins/swsdashboard';
import utils from '@/utils.js';
import Prism from 'prismjs';

export default {
  name: 'SummaryView',
  mixins: [swsdashboard],
  components: {
    TitleBar
  },
  data() {
    return {
      timer: null,
      dbdata: new DbData(),
      dbspec: {
        layout: {
          type: 'grid',
          size: 12
        },
        colorScheme: 'default',
        // prettier-ignore
        widgets: [
          {
            id: 'w16',
            type: 'DbDygraphsBar',
            cspan: 12,
            height: 250,
            properties: {
              options: {
                stackedGraph: true,
                title: 'Traffic',
                ylabel: 'Requests',
                labels: ['Date', 'Success', 'Redirect', 'Client Error','Server Error'],
                legend: 'always',
              },
              opacity: 0.5
            }
          },
          { id: 'w1', type: 'DbNumber', cspan: 2, properties: { title: 'Requests', subtitle: 'Total requests received', icon: 'fa fa-signal' } },
          { id: 'w2', type: 'DbNumber', cspan: 2, properties: {
            title: 'Apdex Score', subtitle: 'Overall Apdex Score', total: 1, trendMax: 1, format: '%.2f',
            percentRanges: [
              { value: 50, color: 'red'},
              { value: 60, color: 'orange'},
              { value: 100, color: 'green'},
            ]}
          },
          { id: 'w3', type: 'DbNumber', cspan: 2, properties: { title: 'Current Req Rate', subtitle: 'Requests per second', footer: 'On last time interval',format: '%.2f', icon: 'fa fa-exchange-alt' } },
          { id: 'w4', type: 'DbNumber', cspan: 2, properties: { title: 'Current Err Rate', subtitle: 'Errors per second', format: '%.2f', icon: 'fa fa-exclamation' } },
          { id: 'w5', type: 'DbNumber', cspan: 2, properties: { title: 'CPU', subtitle: 'CPU Usage', total: 100, trendMax: 100, format: '%.2f %s', qualifier: '%' } },
          { id: 'w6', type: 'DbNumber', cspan: 2, properties: { title: 'Memory', subtitle: 'heapUsed', format: '%.2f %s', icon: 'fa fa-sd-card' } },

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
          { id: 'w12', type: 'DbNumber', cspan: 2, properties: { title: 'Event Loop Lag', subtitle: 'Current Event Loop Lag', format: '%.3f ms',icon: 'fa fa-hourglass-half' } },
          {
            id: 'w14',
            type: 'DbDygraphsLine',
            cspan: 6,
            height: 180,
            properties: {
              options: {
                stackedGraph: false,
                title: 'CPU',
                ylabel: 'CPU, %',
                labels: ['Date','CPU']
              }
            }
          },
          {
            id: 'w18',
            type: 'DbDygraphsLine',
            cspan: 6,
            height: 180,
            properties: {
              options: {
                stackedGraph: false,
                title: 'Apdex Score',
                ylabel: 'Score',
                labels: ['Date','Apdex Score']
              }
            }
          },
          {
            id: 'w15',
            type: 'DbDygraphsLine',
            cspan: 6,
            height: 180,
            properties: {
              options: {
                stackedGraph: false,
                title: 'Memory',
                ylabel: 'MB',
                labels: ['Date','heapTotal', 'heapUsed']
              }
            }
          },
          {
            id: 'w17',
            type: 'DbDygraphsLine',
            cspan: 6,
            height: 180,
            properties: {
              options: {
                stackedGraph: false,
                title: 'Event Loop Lag',
                ylabel: 'msec',
                labels: ['Date','Lag']
              }
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
        this.getStats({ fields: ['timeline', 'apidefs'] });
      }
    },
    statsUpdated: {
      handler: function() {
        this.updateStats();
      }
    }
  },
  mounted() {
    this.initialize();
    this.getStats({ fields: ['timeline', 'apidefs'] });
    this.ready = true;
  },
  methods: {
    ...mapActions({
      getStats: 'stats/getStats' // map `this.getStats()` to `... dispatch('getStats')`
    }),
    initialize: function() {
      this.dbspec.colorScheme = this.dashboardColorScheme;
      // Init dashboard data
      this.dbdata.setWData('w1', { value: 0, trend: [] });
      this.dbdata.setWData('w2', { value: 0, trend: [] });
      this.dbdata.setWData('w3', { value: 0, trend: [] });
      this.dbdata.setWData('w4', { value: 0, trend: [] });
      this.dbdata.setWData('w5', { value: 0, trend: [] });
      this.dbdata.setWData('w6', { value: 0, qualifier: '', trend: [] });
      this.dbdata.setWData('w7', { value: 0, trend: [] });
      this.dbdata.setWData('w8', { value: 0, trend: [] });
      this.dbdata.setWData('w9', { value: 0, trend: [] });
      this.dbdata.setWData('w10', { value: 0, trend: [] });
      this.dbdata.setWData('w11', { value: 0, trend: [] });
      this.dbdata.setWData('w12', { value: 0, trend: [] });
      this.dbdata.setWData('w14', { data: [] });
      this.dbdata.setWData('w15', { data: [] });
      this.dbdata.setWData('w16', { data: [] });
      this.dbdata.setWData('w17', { data: [] });
      this.dbdata.setWData('w18', { data: [] });
    },

    updateStats: function() {
      // Update numbers
      let requestsTotal = pathOr(0, ['all', 'requests'], statsContainer);

      let trendsData = [[], [], [], [], [], [], [], [], [], [], [], []];
      let dthData = [];
      let cpuData = [];
      let memData = [];
      let lagData = [];
      let asData = [];

      let timelineSorted = statsContainer.getSortedTimeline();
      //let trendReqData =  [];
      for (let entry of timelineSorted) {
        dthData.push([
          new Date(entry.ts),
          pathOr(0, ['stats', 'success'], entry),
          pathOr(0, ['stats', 'redirect'], entry),
          pathOr(0, ['stats', 'client_error'], entry),
          pathOr(0, ['stats', 'server_error'], entry)
        ]);
        asData.push([new Date(entry.ts), pathOr(0, ['stats', 'apdex_score'], entry)]);
        cpuData.push([new Date(entry.ts), pathOr(0, ['sys', 'cpu'], entry)]);
        memData.push([new Date(entry.ts), pathOr(0, ['sys', 'heapTotal'], entry) / 1048576, pathOr(0, ['sys', 'heapUsed'], entry) / 1048576]);
        lagData.push([new Date(entry.ts), pathOr(0, ['sys', 'lag'], entry)]);
        // Trends
        trendsData[0].push(pathOr(0, ['stats', 'requests'], entry));
        trendsData[1].push(pathOr(0, ['stats', 'apdex_score'], entry));
        trendsData[2].push(pathOr(0, ['stats', 'req_rate'], entry));
        trendsData[3].push(pathOr(0, ['stats', 'err_rate'], entry));
        trendsData[4].push(pathOr(0, ['sys', 'cpu'], entry));
        trendsData[5].push(pathOr(0, ['sys', 'heapUsed'], entry));
        trendsData[6].push(pathOr(0, ['stats', 'errors'], entry));
        trendsData[7].push(pathOr(0, ['stats', 'success'], entry));
        trendsData[8].push(pathOr(0, ['stats', 'redirect'], entry));
        trendsData[9].push(pathOr(0, ['stats', 'client_error'], entry));
        trendsData[10].push(pathOr(0, ['stats', 'server_error'], entry));
        trendsData[11].push(pathOr(0, ['sys', 'lag'], entry));
      }

      let lastTimeBucket = statsContainer.getCurrentTimelineBucket();
      let requestRate = pathOr(0, ['stats', 'req_rate'], lastTimeBucket);
      let errRate = pathOr(0, ['stats', 'err_rate'], lastTimeBucket);

      let reqTrendMax = Math.max(...trendsData[0]);
      let reqRateTrendMax = Math.max(...trendsData[2]);
      this.dbdata.setWData('w1', { value: requestsTotal, trend: trendsData[0] });
      this.dbdata.setWData('w2', { value: pathOr(0, ['all', 'apdex_score'], statsContainer), trend: trendsData[1] });
      this.dbdata.setWData('w3', { value: requestRate, trend: trendsData[2] });
      this.dbdata.setWData('w4', { value: errRate, trend: trendsData[3], trendMax: reqRateTrendMax });
      this.dbdata.setWData('w5', { value: pathOr(0, ['sys', 'cpu'], statsContainer), trend: trendsData[4] });
      let { value, qualifier } = utils.formatBytes(pathOr(0, ['sys', 'heapUsed'], statsContainer), 2);
      this.dbdata.setWData('w6', { value: value, qualifier: qualifier, trend: trendsData[5] });

      this.dbdata.setWData('w7', { value: pathOr(0, ['all', 'errors'], statsContainer), trend: trendsData[6], trendMax: reqTrendMax, total: requestsTotal });
      this.dbdata.setWData('w8', { value: pathOr(0, ['all', 'success'], statsContainer), trend: trendsData[7], trendMax: reqTrendMax, total: requestsTotal });
      this.dbdata.setWData('w9', { value: pathOr(0, ['all', 'redirect'], statsContainer), trend: trendsData[8], trendMax: reqTrendMax, total: requestsTotal });
      this.dbdata.setWData('w10', { value: pathOr(0, ['all', 'client_error'], statsContainer), trend: trendsData[9], trendMax: reqTrendMax, total: requestsTotal });
      this.dbdata.setWData('w11', { value: pathOr(0, ['all', 'server_error'], statsContainer), trend: trendsData[10], trendMax: reqTrendMax, total: requestsTotal });
      this.dbdata.setWData('w12', { value: pathOr(0, ['sys', 'lag'], statsContainer), trend: trendsData[11] });

      this.dbdata.setWData('w14', { data: cpuData });
      this.dbdata.setWData('w15', { data: memData });
      this.dbdata.setWData('w16', { data: dthData });
      this.dbdata.setWData('w17', { data: lagData });
      this.dbdata.setWData('w18', { data: asData });
    },

    collapse: function(array, chunkSize) {
      let res = [];
      let cidx = 0;
      let aggr = 0;
      for (let v of array) {
        aggr += v;
        cidx++;
        if (cidx === chunkSize) {
          res.push(aggr);
          cidx = 0;
          aggr = 0;
        }
      }
      if (cidx > 0) {
        res.push(aggr);
      }
      return res;
    }
  }
};
</script>
