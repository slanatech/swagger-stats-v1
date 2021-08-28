import { createStore } from 'vuex';
import data from '@/store/modules/data';
import layout from '@/store/modules/layout';

export const store = createStore({
  state: {
    wsConnected: false,
  },
  modules: {
    data,
    layout,
  },
  mutations: {
    SET_WS_CONNECTED(state, { wsConnected }) {
      state.wsConnected = wsConnected;
    },
  },
  actions: {
    setWsConnected({ commit }, { wsConnected = false }) {
      commit('SET_WS_CONNECTED', { wsConnected: wsConnected });
    },
  },
});
