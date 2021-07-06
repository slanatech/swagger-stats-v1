<template>
  <q-page class="sws-page-padding">
    <title-bar title="API" icon="code"></title-bar>
    <div style="padding: 4px;">
      <vue-good-table
        :columns="columns"
        :rows="rows"
        :theme="vgtTheme"
        styleClass="vgt-table condensed bordered striped sws-table"
        :search-options="{
          enabled: true,
          skipDiacritics: true
        }"
        :pagination-options="{
          enabled: true,
          mode: 'records',
          perPage: 30,
          perPageDropdown: [10, 20, 30, 50, 80, 100],
          dropdownAllowAll: true
        }"
      >
        <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field == 'expand'">
            <!--<q-btn flat round color="secondary" icon="play_arrow" size="xs" @click="handleShow(props.row.originalIndex)" />-->
          </span>
          <span v-else-if="props.column.field == 'method'">
            <router-link :to="{ path: 'apiop', query: { method: props.row.method, path: props.row.path } }">{{ props.row.method }}</router-link>
          </span>
          <span v-else-if="props.column.field == 'path'">
            <router-link :to="{ path: 'apiop', query: { method: props.row.method, path: props.row.path } }">{{ props.row.path }}</router-link>
          </span>
          <span v-else>
            {{ props.formattedRow[props.column.field] }}
          </span>
        </template>
      </vue-good-table>
    </div>
  </q-page>
</template>

<script>
import TitleBar from '@/components/titlebar.vue';
import statsContainer from '@/store/statscontainer';
import { mapState, mapActions } from 'vuex';
import { vgtMethods } from '../mixins/vgtmethods';

export default {
  name: 'ApiView',
  components: {
    TitleBar
  },
  mixins: [vgtMethods],
  data() {
    return {
      timer: null,
      isDark: false,
      columns: [
        //{ label: '', field: 'expand', width: '1%', tdClass: 'text-center pointer' },
        { label: 'Method', field: 'method', tdClass: 'text-weight-bold' },
        { label: 'Path', field: 'path', tdClass: 'text-weight-bold' },
        { label: 'Requests', field: 'requests', type: 'number', tdClass: 'text-weight-bold' },
        { label: 'Responses', field: 'responses', type: 'number' },
        { label: 'Apdex Score', field: 'apdex_score', type: 'number', formatFn: this.formatToFixed2, tdClass: this.tdClassApdex },
        { label: 'Errors', field: 'errors', type: 'number', tdClass: this.tdClassErrors },
        { label: 'Req rate', field: 'req_rate', type: 'number', formatFn: this.formatToFixed2 },
        { label: 'Err rate', field: 'err_rate', type: 'number', formatFn: this.formatToFixed2, tdClass: this.tdClassErrRate },
        { label: 'Success', field: 'success', type: 'number' },
        { label: 'Redirect', field: 'redirect', type: 'number' },
        { label: 'Client Error', field: 'client_error', type: 'number', tdClass: this.tdClassCErr },
        { label: 'Server Error', field: 'server_error', type: 'number', tdClass: this.tdClassSErr },
        { label: 'Max Time (ms)', field: 'max_time', type: 'number' },
        { label: 'Avg Time (ms)', field: 'avg_time', type: 'number', formatFn: this.formatToFixed2 },
        { label: 'Avg Req Size', field: 'avg_req_clength', type: 'number', formatFn: this.formatToFixed0 },
        { label: 'Avg Res Size', field: 'avg_res_clength', type: 'number', formatFn: this.formatToFixed0 },
        { label: 'Tags', field: 'tags', type: 'string' }
      ],
      rows: []
    };
  },
  computed: {
    ...mapState({
      dark: state => state.layout.dark,
      statsUpdated: state => state.stats.updated,
      refreshTrigger: state => state.refreshTrigger
    }),
    vgtTheme: function() {
      return this.dark ? 'nocturnal' : 'default';
    }
  },
  watch: {
    refreshTrigger: {
      handler: function() {
        this.getStats({ fields: ['apidefs', 'apistats'] });
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
    this.getStats({ fields: ['apidefs', 'apistats'] });
    this.ready = true;
  },
  methods: {
    ...mapActions({
      getStats: 'stats/getStats' // map `this.getStats()` to `... dispatch('getStats')`
    }),
    initialize: function() {},
    // TODO Reconsider
    loadStats: function() {
      this.timer = setTimeout(() => {
        this.getStats({ fields: ['apistats'] });
      }, 1000);
    },
    updateStats: function() {
      // Update numbers
      //let requestsTotal = pathOr(0, ['all', 'requests'], statsContainer);
      this.rows = statsContainer.getApiStatsArray();

      //this.loadStats();
    }
  }
};
</script>
