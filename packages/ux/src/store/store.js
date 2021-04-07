import Vue from 'vue';
import Vuex from 'vuex';
import api from '@/store/api';
import stats from '@/store/stats';
import layout from '@/store/layout';
import RRRCollection from '@/store/rrrcollection';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    refreshTrigger: 0,
    refreshTimeout: 5000,
    refreshLast: 0,
    intervalId: null,
    rotateTrigger: 0,
    rotateLast: 0,
    rotateTimeout: 15000,
    authenticated: false,
    loggedin: false
  },
  modules: {
    stats,
    layout,
    lasterrors: RRRCollection,
    longestrequests: RRRCollection
  },
  mutations: {
    SET_AUTH(state, { authenticated = false, loggedin = false }) {
      state.authenticated = authenticated;
      state.loggedin = loggedin;
    },
    SET_INTERVAL_ID(state, { id }) {
      state.intervalId = id;
    },
    SET_REFRESH_TIMEOUT(state, { timeout }) {
      state.refreshTimeout = timeout;
    },
    PERFORM_REFRESH(state) {
      state.refreshLast = Date.now();
      state.refreshTrigger = state.refreshLast;
    },
    PERFORM_ROTATE(state) {
      state.rotateLast = Date.now();
      state.rotateTrigger = state.rotateLast;
    }
  },
  actions: {
    initRefresh({ commit, state }) {
      if (state.intervalId) {
        return; // Already set up
      }
      let intervalId = setInterval(() => {
        if (state.refreshTimeout === 0) {
          return;
        }
        let tsNow = Date.now();
        let elapsed = tsNow - state.refreshLast;
        // If we're almost at refresh interval, refresh
        if (elapsed >= state.refreshTimeout - 100) {
          commit('PERFORM_REFRESH');
        }
        // If we're almost at rotate interval, rotate
        let rotateElapsed = tsNow - state.rotateLast;
        if (rotateElapsed >= state.rotateTimeout - 100) {
          commit('PERFORM_ROTATE');
        }
      }, 1000);
      commit('SET_INTERVAL_ID', { id: intervalId });
    },
    setRefreshTimeout({ commit }, { timeout }) {
      commit('SET_REFRESH_TIMEOUT', { timeout: timeout });
    },
    performRefresh({ commit }) {
      commit('PERFORM_REFRESH');
    },
    async login({ commit, dispatch }, { username, password }) {
      let loginResult = await dispatch('stats/getStats', { username: username, password: password });
      commit('SET_AUTH', { authenticated: loginResult.success, loggedin: loginResult.success });
      return loginResult;
    },
    async logout({ commit }) {
      let logoutResult = await api.logout();
      commit('SET_AUTH', { authenticated: false, loggedin: false });
      return logoutResult;
    }
  }
});
