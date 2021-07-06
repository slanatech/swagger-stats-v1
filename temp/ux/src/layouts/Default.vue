<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="text-grey-4 sws-toolbar-bg" height-hint="98">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="leftShown = !leftShown" />

        <!--<img src="logo.png" style="height: 26px; width: 42px;">-->

        <q-toolbar-title>
          swagger-stats
        </q-toolbar-title>

        <!--<q-btn dense flat round icon="menu" @click="rightShown = !rightShown" />-->

        <q-toggle v-model="dark" icon="brightness_medium">
          <q-tooltip anchor="bottom right" self="center middle">Dark Mode</q-tooltip>
        </q-toggle>

        <q-toggle v-model="rotateEnabled" icon="dynamic_feed">
          <q-tooltip anchor="bottom right" self="center middle">Slide show</q-tooltip>
        </q-toggle>

        <q-btn-dropdown dense unelevated v-model="settingsOpen" dropdown-icon="settings" class="ub-btn-dropdown-bare q-ma-xs">
          <settings @close="settingsOpen = false"></settings>
        </q-btn-dropdown>

        <q-btn dense flat size="md" round icon="refresh" @click="performRefresh" />

        <q-btn-toggle v-model="refreshTimeout" text-color="blue-grey-8" toggle-text-color="grey-4" size="md" dense flat :options="refreshOptions" />

        <q-btn v-if="loggedin" dense flat size="md" round icon="logout" @click="performLogout" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above :mini.sync="menuMini" :mini-to-overlay="menuAutoExpand" v-model="leftShown" side="left" bordered @mouseover="handleMouseOver" @mouseout="handleMouseOut">
      <q-list>
        <q-item clickable v-ripple v-for="item in menuItems" v-bind:key="item.link" :to="item.link" exact>
          <q-item-section avatar>
            <q-icon :name="item.icon">
              <q-tooltip anchor="top right" self="center middle">
                {{ item.title }}
              </q-tooltip>
            </q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ item.title }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator></q-separator>
        <q-btn v-if="!menuAutoExpand" :ripple="false" class="full-width" flat :icon="menuMini ? 'chevron_right' : 'chevron_left'" size="md" @click="toggleMiniState" />
      </q-list>
    </q-drawer>

    <q-drawer v-model="rightShown" side="right" bordered> </q-drawer>

    <q-page-container>
      <transition :name="transitionName">
        <router-view />
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { dbColors } from 'dashblocks';
import Settings from '../components/settings/settings.vue';

export default {
  name: 'SwsUxLayout',
  components: {
    Settings
  },
  data() {
    return {
      miniState: true,
      leftShown: true,
      rightShown: false,
      settingsOpen: false,
      transitionName: '',
      testColors: null,
      menuItems: [
        { title: 'Summary', link: '/', icon: 'trending_up' },
        { title: 'Requests', link: '/requests', icon: 'sync_alt' },
        { title: 'Errors', link: '/errors', icon: 'error' },
        { title: 'API', link: '/api', icon: 'code' },
        { title: 'API Operation', link: '/apiop', icon: 'settings_ethernet' },
        { title: 'API Responses', link: '/apiresponses', icon: 'pie_chart' },
        { title: 'Rates & Durations', link: '/rates', icon: 'schedule' },
        { title: 'Payload', link: '/payload', icon: 'swap_vert' },
        { title: 'Last Errors', link: '/lasterrors', icon: 'error_outline' },
        { title: 'Longest Requests', link: '/longestrequests', icon: 'hourglass_empty' }
      ],
      refreshOptions: [
        { icon: 'pause', value: 0 },
        { label: '1s', value: 1000 },
        { label: '5s', value: 5000 },
        { label: '15s', value: 15000 },
        { label: '30s', value: 30000 },
        { label: '1m', value: 60000 }
      ],
      //rotateEnabled: false,
      rotateCurrent: -1,
      rotateOptions: ['/', '/requests', '/errors', '/api', '/apiresponses', '/rates', '/payload']
    };
  },
  computed: {
    ...mapState({
      authenticated: state => state.authenticated,
      loggedin: state => state.loggedin,
      rotateTrigger: state => state.rotateTrigger,
      menuAutoExpand: state => state.layout.menuAutoExpand
    }),
    refreshTimeout: {
      get() {
        return this.$store.state.refreshTimeout;
      },
      set(value) {
        this.setRefreshTimeout({ timeout: value });
      }
    },
    dark: {
      get() {
        return this.$store.state.layout.dark;
      },
      set(value) {
        this.setDark({ dark: value });
      }
    },
    menuMini: {
      get() {
        return this.$store.state.layout.menuMini;
      },
      set(value) {
        this.setMenuMini({ menuMini: value });
      }
    },
    rotateEnabled: {
      get() {
        return this.$store.state.layout.rotateEnabled;
      },
      set(value) {
        this.setRotateEnabled({ rotateEnabled: value });
      }
    },
  },
  watch: {
    dark: {
      handler: function(val) {
        this.$q.dark.set(val);
      }
    },
    rotateEnabled: {
      handler: function(val) {
        if (val) {
          this.rotateCurrent = -1;
        }
      }
    },
    menuMini: {
      handler: function(val) {
        // need to wait a bit till it fully expands/collapses
        this.$nextTick(() => {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 200);
        });
      }
    },
    rotateTrigger: {
      handler: function() {
        if (!this.rotateEnabled) {
          return;
        }
        this.rotateCurrent++;
        if (this.rotateCurrent >= this.rotateOptions.length) {
          this.rotateCurrent = 0;
        }
        this.transitionName = 'fade';
        this.$router.push(this.rotateOptions[this.rotateCurrent]);
        this.$nextTick(() => {
          setTimeout(() => {
            this.transitionName = '';
          }, 550);
        });
      }
    }
  },
  mounted() {
    this.initialize();
    this.$q.dark.set(this.dark);
    this.initRefresh();
  },
  methods: {
    ...mapActions({
      setDark: 'layout/setDark',
      setMenuMini: 'layout/setMenuMini',
      setRotateEnabled: 'layout/setRotateEnabled',
      initRefresh: 'initRefresh',
      setRefreshTimeout: 'setRefreshTimeout', // map `this.getStats()` to `... dispatch('getStats')`
      performRefresh: 'performRefresh',
      logout: 'logout'
    }),
    initialize() {
      let dbc = dbColors;

      //this.testColors = dbColors.getColors(true); // TEMP TODO REMOVE
      let cSteps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

      dbColors.setColorScheme('default', {
        light: dbColors.d3ScaleChromatic.schemeTableau10,
        dark: dbColors.grafanaColors
      });

      dbColors.setColorScheme('Grafana', {
        light: dbColors.grafanaColors,
        dark: dbColors.grafanaColors
      });

      dbColors.setColorScheme('Tableau', {
        light: dbColors.d3ScaleChromatic.schemeTableau10,
        dark: dbColors.d3ScaleChromatic.schemeTableau10
      });

      dbColors.setColorScheme('Diverging', {
        light: dbColors.d3ScaleChromatic.schemeRdYlBu[10],
        dark: dbColors.d3ScaleChromatic.schemeRdYlBu[10]
      });

      dbColors.setColorScheme('Categorical', {
        light: dbColors.d3ScaleChromatic.schemeDark2,
        dark: dbColors.d3ScaleChromatic.schemeSet3 // schemeBuGn[9],
      });

      dbColors.setColorScheme('Warm', {
        light: cSteps.map(x => dbColors.d3ScaleChromatic.interpolateWarm(x)),
        dark: cSteps.map(x => dbColors.d3ScaleChromatic.interpolateWarm(x))
      });

      dbColors.setColorScheme('Cool', {
        light: cSteps.map(x => dbColors.d3ScaleChromatic.interpolateCool(x)),
        dark: cSteps.map(x => dbColors.d3ScaleChromatic.interpolateCool(x))
      });

      dbColors.setColorScheme('Calm', {
        light: ['#912e4d', '#00bd56', '#f02192', '#acd36d', '#8079ff', '#919200', '#f1adff', '#547600', '#ff8241', '#f8ba7a'],
        dark: ['#ce4c3a', '#60b14d', '#8162cb', '#bab141', '#c964b5', '#4bb092', '#c25874', '#717e37', '#688ccd', '#c78344']
      });
      //['#cc4ba2', '#64ac48', '#8361cd', '#9a963f', '#5f8cce', '#cd5136', '#4aac8d', '#c7596d', '#c78543', '#b578b6']
      //['#ce4c3a', '#60b14d', '#8162cb', '#bab141', '#c964b5', '#4bb092', '#c25874', '#717e37', '#688ccd', '#c78344']

      dbColors.setColorScheme('Fancy', {
        light: ['#38646f', '#4e2300', '#274f8e', '#6b5e1f', '#794f81', '#2a2e00', '#00485e', '#7c553f', '#2e0a06', '#2b2219'],
        dark: ['#b1d8a0', '#74aff3', '#dbcd9d', '#7bcaed', '#ebaba7', '#74d6e0', '#deb1e0', '#a1e9d1', '#adbce9', '#8dc4af']
      });

      dbColors.setColorScheme('Colorblind Friendly', {
        light: ['#37efab', '#58006c', '#b3e370', '#9a73ec', '#b1a200', '#0051ab', '#ff9e6a', '#601016', '#685d00', '#de3357'],
        dark: ['#78a563', '#666fe8', '#c1b01b', '#014ca6', '#ffca5e', '#e2b1ff', '#008418', '#ff77bf', '#811e00', '#ff8c56']
      });
    },
    toggleMiniState() {
      this.menuMini = !this.menuMini;
    },
    async performLogout() {
      await this.logout();
      this.$router.push('/login');
    },
    handleMouseOver() {
      if (this.menuAutoExpand) {
        this.menuMini = false;
      }
    },
    handleMouseOut() {
      if (this.menuAutoExpand) {
        this.menuMini = true;
      }
    }
  }
};
</script>
<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
