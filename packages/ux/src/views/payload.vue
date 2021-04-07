<template>
  <q-page class="sws-page-padding">
    <title-bar title="Payload" icon="swap_vert"></title-bar>
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

export default {
  name: 'SummaryView',
  mixins: [swsdashboard],
  components: {
    TitleBar
  },
  data() {
    return {
      timer: null,
      isDark: false,
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
            id: 'w14',
            type: 'DbDygraphsBar',
            cspan: 12,
            height: 250,
            properties: {
              options: {
                stackedGraph: true,
                title: 'Received / Sent',
                ylabel: 'bytes',
                labels: ['Date', 'Received', 'Sent'],
                legend: 'always'
              }
            }
          },

          { id: 'w1', type: 'DbNumber', cspan: 2, properties: { title: 'Received', subtitle: 'Total received', format: '%.2f %s'}},
          { id: 'w4', type: 'DbNumber', cspan: 2, properties: { title: 'Sent', subtitle: 'Total Sent', format: '%.2f %s' } },

          { id: 'w2', type: 'DbNumber', cspan: 2, properties: { title: 'Avg Req Payload', subtitle: 'Avg Req Content Len', format: '%f', icon: 'fa fa-exchange-alt' } },
          { id: 'w3', type: 'DbNumber', cspan: 2, properties: { title: 'Avg Res Payload', subtitle: 'Avg Res Content Len', format: '%f' } },

          { id: 'w5', type: 'DbNumber', cspan: 2, properties: { title: 'Max Req Payload', subtitle: 'Max Req Content Len', format: '%f', icon: 'fa fa-exclamation' } },
          { id: 'w6', type: 'DbNumber', cspan: 2, properties: { title: 'Max Res Payload', subtitle: 'Max Res Content Len', format: '%f',icon: 'fa fa-hourglass-half' } },

          {
            id: 'w15',
            type: 'DbDygraphsLine',
            cspan: 12,
            height: 200,
            properties: {
              options: {
                stackedGraph: false,
                title: 'Requests Payload',
                ylabel: 'bytes',
                labels: ['Date','Max Payload','Avg Payload']
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
                title: 'Responses Payload',
                ylabel: 'bytes',
                labels: ['Date','Max Payload','Avg Payload']
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
      this.dbdata.setWData('w6', { value: 0 });
      this.dbdata.setWData('w14', { data: [[new Date(), 0, 0]] });
      this.dbdata.setWData('w15', { data: [[new Date(), 0, 0]] });
      this.dbdata.setWData('w16', { data: [[new Date(), 0, 0]] });
    },

    updateStats: function() {
      // Update numbers
      let trendsData = [[], [], [], [], [], []];
      let reqData = [];
      let resData = [];
      let rsData = [];

      let timelineSorted = statsContainer.getSortedTimeline();
      //let trendReqData =  [];
      for (let entry of timelineSorted) {
        rsData.push([new Date(entry.ts), pathOr(0, ['stats', 'total_req_clength'], entry), pathOr(0, ['stats', 'total_res_clength'], entry)]);
        reqData.push([new Date(entry.ts), pathOr(0, ['stats', 'max_req_clength'], entry), pathOr(0, ['stats', 'avg_req_clength'], entry)]);
        resData.push([new Date(entry.ts), pathOr(0, ['stats', 'max_res_clength'], entry), pathOr(0, ['stats', 'avg_res_clength'], entry)]);
        trendsData[0].push(pathOr(0, ['stats', 'total_req_clength'], entry));
        trendsData[3].push(pathOr(0, ['stats', 'total_res_clength'], entry));

        trendsData[1].push(pathOr(0, ['stats', 'avg_req_clength'], entry));
        trendsData[2].push(pathOr(0, ['stats', 'avg_res_clength'], entry));

        trendsData[4].push(pathOr(0, ['stats', 'max_req_clength'], entry));
        trendsData[5].push(pathOr(0, ['stats', 'max_res_clength'], entry));
      }

      // let lastTimeBucket = statsContainer.getCurrentTimelineBucket();

      let received = pathOr(0, ['all', 'total_req_clength'], statsContainer);
      let sent = pathOr(0, ['all', 'total_res_clength'], statsContainer);
      let avgReceived = pathOr(0, ['all', 'avg_req_clength'], statsContainer);
      let avgSent = pathOr(0, ['all', 'avg_res_clength'], statsContainer);
      let maxReceived = pathOr(0, ['all', 'max_req_clength'], statsContainer);
      let maxSent = pathOr(0, ['all', 'max_res_clength'], statsContainer);

      let rsMax = Math.max(Math.max(...trendsData[0]), Math.max(...trendsData[3]));
      let arsMax = Math.max(Math.max(...trendsData[1]), Math.max(...trendsData[2]));
      let mrsMax = Math.max(Math.max(...trendsData[4]), Math.max(...trendsData[5]));

      // ??? total: rsTotal
      let { value, qualifier } = utils.formatBytes(received, 2);
      this.dbdata.setWData('w1', { value: value, qualifier: qualifier, trend: trendsData[0], trendMax: rsMax });
      ({ value, qualifier } = utils.formatBytes(sent, 2));
      this.dbdata.setWData('w4', { value: value, qualifier: qualifier, trend: trendsData[3], trendMax: rsMax });

      this.dbdata.setWData('w2', { value: avgReceived, trend: trendsData[1], trendMax: arsMax });
      this.dbdata.setWData('w3', { value: avgSent, trend: trendsData[2], trendMax: arsMax });

      this.dbdata.setWData('w5', { value: maxReceived, trend: trendsData[4], trendMax: mrsMax });
      this.dbdata.setWData('w6', { value: maxSent, trend: trendsData[5], trendMax: mrsMax });

      this.dbdata.setWData('w14', { data: rsData });
      this.dbdata.setWData('w15', { data: reqData });
      this.dbdata.setWData('w16', { data: resData });
    }
  }
};
</script>
