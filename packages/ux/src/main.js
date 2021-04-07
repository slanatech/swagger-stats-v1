import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store/store';
import VueGoodTablePlugin from 'vue-good-table';
import 'vue-good-table/dist/vue-good-table.css';

import './quasar';

import {
  DashBlocks,
  DbDashboard,
  DbChartjsBar,
  DbChartjsHorizontalBar,
  DbChartjsDoughnut,
  DbChartjsLine,
  DbChartjsPie,
  DbChartjsPolarArea,
  DbChartjsRadar,
  DbChartjsBubble,
  DbChartjsScatter,
  DbNumber,
  DbEasyPie,
  DbSparkline,
  DbDygraphsBar,
  DbDygraphsLine
} from 'dashblocks';

Vue.use(DashBlocks, {
  components: {
    DbDashboard,
    DbChartjsBar,
    DbChartjsHorizontalBar,
    DbChartjsDoughnut,
    DbChartjsLine,
    DbChartjsPie,
    DbChartjsPolarArea,
    DbChartjsRadar,
    DbChartjsBubble,
    DbChartjsScatter,
    DbNumber,
    DbEasyPie,
    DbSparkline,
    DbDygraphsBar,
    DbDygraphsLine
  }
});

// Dashblocks CSS
import 'dashblocks/src/assets/scss/dashblocks.scss';

Vue.config.productionTip = false;

Vue.use(VueGoodTablePlugin);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
