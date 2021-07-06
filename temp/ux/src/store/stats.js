import api from '@/store/api';
import router from '@/router';
import statsContainer from '@/store/statscontainer';
import { Notify } from 'quasar';

// TODO consider placeholders
const state = {
  updated: 0,
};

const getters = {};

const mutations = {
  SET_STATS(state, { stats }) {
    // We store all stats in container: there is no need to make all stats observable,
    // size of stats can be quite big and they can be updated frequently
    // In Vuex we store the timestamp of last stats update, so views can watch on it and react
    statsContainer.updateStats(stats);
    document.title = stats.name || 'swagger-stats';
    state.updated = Date.now();
  },
};

const actions = {
  async getStats({ commit }, { fields = null, method = null, path = null, username = null, password = null }) {
    let stats = null;
    let getStatsRes = await api.getStats({ fields: fields, method: method, path: path, username: username, password: password });
    if (getStatsRes.success) {
      stats = getStatsRes.payload;
      commit('SET_STATS', { stats: stats });
    } else {
      commit('SET_STATS', { stats: {} });
      Notify.create({
        position: 'top',
        type: 'negative',
        message: 'API ERROR',
        caption: `${getStatsRes.message} (${getStatsRes.code})`,
      });
      if (getStatsRes.code === 403) {
        router.push('/login');
      }
    }
    return getStatsRes;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
