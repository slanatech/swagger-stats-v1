<template>
  <q-page class="sws-page-padding">
    <title-bar title="Rates & Durations" icon="schedule"></title-bar>
    <db-dashboard v-if="ready" :dbspec="dbspec" :dbdata="dbdata" :dark="dark"> </db-dashboard>
  </q-page>
</template>

<script>
import { DbData } from 'dashblocks';
import TitleBar from '@/components/titlebar.vue';
import { pathOr } from 'ramda';
import statsContainer from '@/store/statscontainer';
import { swsdashboard } from '../mixins/swsdashboard';
import { mapState, mapActions } from 'vuex';

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

          { id: 'w1', type: 'DbNumber', cspan: 2, properties: {
              title: 'Current Apdex Score', subtitle: 'Apdex Score', total: 1, trendMax: 1, format: '%.2f',
              percentRanges: [
                { value: 50, color: 'red'},
                { value: 60, color: 'orange'},
                { value: 100, color: 'green'},
              ]}
          },
          { id: 'w2', type: 'DbNumber', cspan: 2, properties: { title: 'Current Req Rate', subtitle: 'Requests per second', format: '%.2f', icon: 'fa fa-exchange-alt' } },
          { id: 'w3', type: 'DbNumber', cspan: 2, properties: { title: 'Current Err Rate', subtitle: 'Errors per second', format: '%.2f' } },
          { id: 'w4', type: 'DbNumber', cspan: 2, properties: { title: 'Current Max HT', subtitle: 'Max Handle Time', format: '%.2f', icon: 'fa fa-exclamation' } },
          { id: 'w5', type: 'DbNumber', cspan: 2, properties: { title: 'Current Avg HT', subtitle: 'Avg Handle Time', format: '%.2f', icon: 'fa fa-exclamation' } },
          { id: 'w6', type: 'DbNumber', cspan: 2, properties: { title: 'Current Lag', subtitle: 'Current Event Loop Lag', format: '%.3f ms',icon: 'fa fa-hourglass-half' } },

          { id: 'w7', type: 'DbNumber', cspan: 2, properties: {
              title: 'Overall Apdex Score', subtitle: 'Apdex Score of all time', total: 1, trendMax: 1, format: '%.2f',
              percentRanges: [
                { value: 50, color: 'red'},
                { value: 60, color: 'orange'},
                { value: 100, color: 'green'},
              ]}
          },
          { id: 'w8', type: 'DbNumber', cspan: 2, properties: { title: 'Overall Req Rate', subtitle: 'Req rate of all time', format: '%.2f', icon: 'fa fa-exchange-alt' } },
          { id: 'w9', type: 'DbNumber', cspan: 2, properties: { title: 'Overall Err Rate', subtitle: 'Err rate of all time', format: '%.2f' } },
          { id: 'w10', type: 'DbNumber', cspan: 2, properties: { title: 'Overall Max HT', subtitle: 'Max Handle Time of all time', format: '%.2f', icon: 'fa fa-exclamation' } },
          { id: 'w11', type: 'DbNumber', cspan: 2, properties: { title: 'Overall Avg HT', subtitle: 'Avg Handle Time of all time', format: '%.2f', icon: 'fa fa-exclamation' } },
          { id: 'w12', type: 'DbNumber', cspan: 2, properties: { title: 'Overall Max Lag', subtitle: 'Max Observed Event Loop Lag', format: '%.3f ms',icon: 'fa fa-hourglass-half' } },

          {
            id: 'w14',
            type: 'DbDygraphsLine',
            cspan: 12,
            height: 200,
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
            cspan: 12,
            height: 200,
            properties: {
              options: {
                stackedGraph: false,
                title: 'Request and Error Rates Trend',
                ylabel: 'req per second',
                labels: ['Date','Req Rate', 'Err Rate']
              }
            }
          },

          {
            id: 'w16',
            type: 'DbDygraphsLine',
            cspan: 12,
            height: 200,
            properties: {
              options: {
                stackedGraph: false,
                title: 'Handle Time Trend',
                ylabel: 'msec',
                labels: ['Date','Max HT', 'Avg HT']
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
      statsUpdated: state => state.stats.updated,
      refreshTrigger: state => state.refreshTrigger
    })
  },
  watch: {
    refreshTrigger: {
      handler: function() {
        this.getStats({ fields: ['timeline'] });
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
    this.getStats({ fields: ['timeline'] });
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
      this.dbdata.setWData('w6', { value: 0 });
      this.dbdata.setWData('w7', { value: 0 });
      this.dbdata.setWData('w8', { value: 0 });
      this.dbdata.setWData('w9', { value: 0 });
      this.dbdata.setWData('w10', { value: 0 });
      this.dbdata.setWData('w11', { value: 0 });
      this.dbdata.setWData('w12', { value: 0 });
      this.dbdata.setWData('w14', { data: [] });
      this.dbdata.setWData('w15', { data: [] });
      this.dbdata.setWData('w16', { data: [] });
    },

    updateStats: function() {
      // Update numbers

      let trendsData = [[], [], [], [], []];
      let asData = [];
      let reqErrTrendData = [];
      let htData = [];

      let timelineSorted = statsContainer.getSortedTimeline();
      //let trendReqData =  [];
      for (let entry of timelineSorted) {
        asData.push([new Date(entry.ts), pathOr(0, ['stats', 'apdex_score'], entry)]);
        reqErrTrendData.push([new Date(entry.ts), pathOr(0, ['stats', 'req_rate'], entry), pathOr(0, ['stats', 'err_rate'], entry)]);
        htData.push([new Date(entry.ts), pathOr(0, ['stats', 'max_time'], entry), pathOr(0, ['stats', 'avg_time'], entry)]);
        trendsData[0].push(pathOr(0, ['stats', 'apdex_score'], entry));
        trendsData[1].push(pathOr(0, ['stats', 'req_rate'], entry));
        trendsData[2].push(pathOr(0, ['stats', 'err_rate'], entry));
        trendsData[3].push(pathOr(0, ['stats', 'max_time'], entry));
        trendsData[4].push(pathOr(0, ['stats', 'avg_time'], entry));
      }

      let lastTimeBucket = statsContainer.getCurrentTimelineBucket();
      let apdexScore = pathOr(0, ['stats', 'apdex_score'], lastTimeBucket);
      let requestRate = pathOr(0, ['stats', 'req_rate'], lastTimeBucket);
      let errRate = pathOr(0, ['stats', 'err_rate'], lastTimeBucket);
      let maxHT = pathOr(0, ['stats', 'max_time'], lastTimeBucket);
      let avgHT = pathOr(0, ['stats', 'avg_time'], lastTimeBucket);

      let reqRateTrendMax = Math.max(...trendsData[1]);
      let mahHTTrendMax = Math.max(...trendsData[3]);
      this.dbdata.setWData('w1', { value: apdexScore, trend: trendsData[0] });
      this.dbdata.setWData('w2', { value: requestRate, trend: trendsData[1] });
      this.dbdata.setWData('w3', { value: errRate, trend: trendsData[2], total: requestRate, trendMax: reqRateTrendMax });
      this.dbdata.setWData('w4', { value: maxHT, trend: trendsData[3] });
      this.dbdata.setWData('w5', { value: avgHT, trend: trendsData[4], trendMax: mahHTTrendMax });
      this.dbdata.setWData('w6', { value: pathOr(0, ['sys', 'lag'], statsContainer) });

      let overallReqRate = pathOr(0, ['all', 'req_rate'], statsContainer);
      this.dbdata.setWData('w7', { value: pathOr(0, ['all', 'apdex_score'], statsContainer) });
      this.dbdata.setWData('w8', { value: overallReqRate });
      this.dbdata.setWData('w9', { value: pathOr(0, ['all', 'err_rate'], statsContainer), total: overallReqRate });
      this.dbdata.setWData('w10', { value: pathOr(0, ['all', 'max_time'], statsContainer) });
      this.dbdata.setWData('w11', { value: pathOr(0, ['all', 'avg_time'], statsContainer) });
      this.dbdata.setWData('w12', { value: pathOr(0, ['sys', 'maxlag'], statsContainer) });

      this.dbdata.setWData('w14', { data: asData });
      this.dbdata.setWData('w15', { data: reqErrTrendData });
      this.dbdata.setWData('w16', { data: htData });
    }
  }
};
</script>
