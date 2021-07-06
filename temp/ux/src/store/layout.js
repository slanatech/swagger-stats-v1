/*
 * Layout state Vuex Module
 */

//import { dbColors } from 'dashblocks';

const state = {
  dark: (localStorage['sws-dark-mode'] || 'false') === 'true',
  menuAutoExpand: (localStorage['sws-menu-auto-expand'] || 'false') === 'true',
  menuMini: (localStorage['sws-menu-mini'] || 'false') === 'true',
  dashboardColorScheme: localStorage['sws-dashboard-color-scheme'] || 'Standard',
  rotateEnabled: localStorage['sws-rotate-enabled'] === 'true',
};

const getters = {};

const mutations = {
  SET_DARK(state, { dark }) {
    localStorage['sws-dark-mode'] = dark;
    state.dark = dark;
  },
  SET_MENU_AUTO_EXPAND(state, { menuAutoExpand }) {
    localStorage['sws-menu-auto-expand'] = menuAutoExpand;
    state.menuAutoExpand = menuAutoExpand;
  },
  SET_MENU_MINI(state, { menuMini }) {
    localStorage['sws-menu-mini'] = menuMini;
    state.menuMini = menuMini;
  },
  SET_DASHBOARD_COLOR_SCHEME(state, { dashboardColorScheme }) {
    localStorage['sws-dashboard-color-scheme'] = dashboardColorScheme;
    state.dashboardColorScheme = dashboardColorScheme;
  },
  SET_ROTATE_ENABLED(state, { rotateEnabled }) {
    localStorage['sws-rotate-enabled'] = rotateEnabled ? 'true' : 'false';
    state.rotateEnabled = rotateEnabled;
  },
};

const actions = {
  setDark({ commit }, { dark }) {
    commit('SET_DARK', { dark: dark });
  },
  setMenuAutoExpand({ commit }, { menuAutoExpand }) {
    commit('SET_MENU_AUTO_EXPAND', { menuAutoExpand: menuAutoExpand });
  },
  setMenuMini({ commit }, { menuMini }) {
    commit('SET_MENU_MINI', { menuMini: menuMini });
  },
  setDashboardColorScheme({ commit }, { dashboardColorScheme }) {
    commit('SET_DASHBOARD_COLOR_SCHEME', { dashboardColorScheme: dashboardColorScheme });
  },
  setRotateEnabled({ commit }, { rotateEnabled }) {
    commit('SET_ROTATE_ENABLED', { rotateEnabled: rotateEnabled });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
