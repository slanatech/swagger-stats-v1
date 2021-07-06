<template>
  <q-page class="sws-page-padding">
    <title-bar :title="title" :icon="icon"></title-bar>
    <q-splitter v-model="splitterModel" :limits="[50, 100]" after-class="q-splitter-panel-height-auto">
      <template v-slot:before>
        <div style="padding: 4px;">
          <vue-good-table
            :columns="columns"
            :rows="rows"
            :theme="vgtTheme"
            styleClass="vgt-table condensed bordered striped sws-table"
            :row-style-class="getRowClass"
            :search-options="{ enabled: true, skipDiacritics: true }"
            :pagination-options="{ enabled: true, mode: 'records', perPage: 25, perPageDropdown: [10, 25, 50, 80, 100], dropdownAllowAll: true }"
            :sort-options="{
              enabled: true,
              initialSortBy: { field: sortField, type: sortOrder }
            }"
            @on-sort-change="onSortChange"
          >
            <template slot="table-row" slot-scope="props">
              <span v-if="props.column.field == 'expand'">
                <!--<q-icon name="visibility" />-->
                <q-btn flat round color="secondary" icon="play_arrow" size="xs" @click="handleShow(props.row.originalIndex)" />
              </span>
              <span v-else-if="props.column.field == 'method'">
                <router-link :to="{ path: 'apiop', query: { method: props.row.method, path: props.row.api.path } }">{{ props.row.method }}</router-link>
              </span>
              <span v-else-if="props.column.field == 'api.path'">
                <router-link :to="{ path: 'apiop', query: { method: props.row.method, path: props.row.api.path } }">{{ props.row.api.path }}</router-link>
              </span>
              <!--<span v-else-if="props.column.field == 'path'">
                <div style="font-weight: bold; color: blue;position: relative;">{{ props.row.path }}<div class="sws-css-bar" :style="`width: ${props.row.responsetime/122*100}%;`"></div></div>
              </span>-->
              <span v-else>
                {{ props.formattedRow[props.column.field] }}
              </span>
            </template>
          </vue-good-table>
        </div>
      </template>

      <template v-slot:after>
        <div class="q-pa-xs full-height" style="min-height: 90vh;">
          <q-scroll-area ref="scrollArea" class="full-height" style="min-height: 90vh;">
            <q-list bordered class="rounded-borders" style="min-height: 90vh;">
              <div v-for="(item, index) in storedItems" v-bind:key="item.key" :id="item.key">
                <q-expansion-item v-model="expanded[index]" header-class="sws-bg-gradient-a3a1a3">
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-avatar icon="sync_alt" color="accent" text-color="white" />
                    </q-item-section>

                    <q-item-section>
                      <div>{{ getTitle(item.data) }}</div>
                      <div class="text-caption">{{ item.data['@timestamp'] }}</div>
                    </q-item-section>

                    <q-item-section side>
                      <q-btn-group>
                        <q-btn flat round icon="filter_none" size="sm" v-on:click.stop="handleCopy(index)" />
                        <q-btn flat round icon="clear" size="sm" v-on:click.stop="handleClear(index)" />
                      </q-btn-group>
                    </q-item-section>
                  </template>
                  <q-card>
                    <q-card-section>
                      <pre><code :class="codeClass">{{JSON.stringify(item.data,null,2)}}</code></pre>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
                <q-separator />
              </div>
            </q-list>
          </q-scroll-area>
        </div>
      </template>
    </q-splitter>
  </q-page>
</template>

<script>
import TitleBar from '@/components/titlebar.vue';
import { pathOr, propEq, findIndex } from 'ramda';
import statsContainer from '@/store/statscontainer';
import { mapState, mapActions } from 'vuex';
import { vgtMethods } from '../mixins/vgtmethods';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';

export default {
  name: 'LastErrorsView',
  components: {
    TitleBar
  },
  mixins: [vgtMethods],
  data() {
    return {
      splitterModel: 100, // start at 50%
      title: 'Last Errors',
      icon: 'error_outline',
      statsField: 'lasterrors',
      sortField: '@timestamp',
      sortOrder: 'desc',
      expanded: [],
      timer: null,
      isDark: false,
      columns: [
        { label: '', field: 'expand', width: '1%', tdClass: 'text-center pointer' },
        {
          label: 'Time',
          field: '@timestamp',
          width: '10%',
          thClass: 'text-left',
          tdClass: 'nowrap text-left text-body2',
          type: 'date',
          dateInputFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSX",
          dateOutputFormat: 'LLL do yyyy, HH:mm:ss.SSS'
        },
        { label: 'Method', field: 'method', width: '10%', tdClass: 'text-weight-bold' },
        { label: 'Path', field: 'api.path', width: '30%', tdClass: 'text-weight-bold' },
        { label: 'URL', field: 'path', width: '39%' },
        { label: 'Response Time', field: 'responsetime', width: '5%', type: 'number', tdClass: 'text-weight-bold' },
        { label: 'Response Code', field: 'http.response.code', width: '5%', type: 'number', tdClass: 'text-weight-bold' }
      ],
      rows: [],
      requestResponseRecord: ''
    };
  },
  computed: {
    ...mapState({
      dark: state => state.layout.dark,
      statsUpdated: state => state.stats.updated,
      storedItems: state => state.lasterrors.items,
      expandedState: state => state.lasterrors.expanded
    }),
    vgtTheme: function() {
      return this.dark ? 'nocturnal' : 'default';
    },
    codeClass: function() {
      return 'language-json ' + (this.dark ? 'sws-code-dark' : 'sws-code');
    }
  },
  watch: {
    statsUpdated: {
      handler: function() {
        this.updateStats();
      }
    },
    storedItems: {
      handler: function() {
        if (this.storedItems.length > 0) {
          if (this.splitterModel === 100) {
            this.splitterModel = 60;
          }
        } else {
          this.splitterModel = 100;
        }
        this.$nextTick(() => {
          Prism.highlightAll();
        });
      }
    }
  },
  mounted() {
    Prism.manual = true;
    this.initialize();
    this.splitterModel = this.storedItems.length > 0 ? 60 : 100;
    // Retrieve expanded state
    this.expanded = [...this.expandedState];
  },
  updated: function() {
    this.$nextTick(() => {
      Prism.highlightAll();
    });
  },
  beforeDestroy: function() {
    // Store expanded state
    this.setExpanded({ expanded: this.expanded });
  },
  methods: {
    ...mapActions({
      getStats: 'stats/getStats', // map `this.getStats()` to `... dispatch('getStats')`
      addStoredItem: 'lasterrors/add',
      removeStoredItem: 'lasterrors/remove',
      setExpanded: 'lasterrors/setExpanded'
    }),
    initialize: function() {
      this.getStats({ fields: [this.statsField] });
    },
    getKey(rrr) {
      return rrr.path + '.' + rrr.startts;
    },
    getTitle(rrr) {
      return `${rrr.method} ${rrr.path} - ${rrr.http.response.code} (${rrr.responsetime} ms)`;
    },
    getRowClass(row) {
      let key = this.getKey(row);
      let exists = findIndex(propEq('key', key))(this.storedItems);
      if (exists >= 0) {
        return 'sws-bg-gradient-a3a1a3';
      } else {
        return '';
      }
    },
    handleShow(rowIndex) {
      let item = this.rows[rowIndex];
      let key = this.getKey(item);
      let exists = findIndex(propEq('key', key))(this.storedItems);
      if (exists >= 0) {
        // Expand & Scroll to item already shown
        let child = document.getElementById(key);
        if (this.expanded[exists]) {
          this.$refs.scrollArea.setScrollPosition(child.offsetTop, 500);
        } else {
          this.$set(this.expanded, exists, true);
          // need to wait a bit till it fully expands
          setTimeout(() => {
            this.$refs.scrollArea.setScrollPosition(child.offsetTop, 500);
          }, 500);
        }
      } else {
        this.expanded.unshift(true);
        this.addStoredItem({ key: key, data: item });
        this.$refs.scrollArea.setScrollPosition(0);
      }
    },
    handleClear(index) {
      this.expanded.splice(index, 1);
      this.removeStoredItem({ index: index });
    },
    handleCopy(index) {
      let tempInput = document.createElement('textarea');
      tempInput.style = 'position: absolute; left: -1000px; top: -1000px';
      tempInput.value = JSON.stringify(this.storedItems[index].data, null, 2);
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
    },
    updateStats: function() {
      // Update numbers
      //let requestsTotal = pathOr(0, ['all', 'requests'], statsContainer);
      this.rows = pathOr([], [this.statsField], statsContainer);
      //this.loadStats();
    },
    onSortChange(params) {
      // params is array [{field:'name',type:'asc|desc'},...]
      this.sortField = pathOr('@timestamp', [0, 'field'], params);
      this.sortOrder = pathOr('@timestamp', [0, 'type'], params);
    }
  }
};
</script>
