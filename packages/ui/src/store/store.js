import { createStore } from 'vuex';
import data from '@/store/modules/data';
import layout from '@/store/modules/layout';
import wsConnection from '../store/wsconnection';

export const store = createStore({
  state: {
    wsConnected: false,
    trace: false,
  },
  modules: {
    data,
    layout,
  },
  mutations: {
    SET_WS_CONNECTED(state, { wsConnected }) {
      state.wsConnected = wsConnected;
    },
    SET_TRACE(state, { trace }) {
      state.trace = trace;
    },
  },
  actions: {
    setWsConnected({ commit }, { wsConnected = false }) {
      commit('SET_WS_CONNECTED', { wsConnected: wsConnected });
    },
    startTrace({ commit, state }) {
      if (!state.wsConnected || state.trace) {
        return;
      }
      wsConnection.startTrace();
      commit('SET_TRACE', { trace: true });
    },
    stopTrace({ commit, state }) {
      if (!state.wsConnected || !state.trace) {
        return;
      }
      wsConnection.stopTrace();
      commit('SET_TRACE', { trace: false });
    },
  },
});
