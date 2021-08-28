import api from '@/store/api';

const state = {
  data: {},
};

const getters = {};

const mutations = {
  SET_DATA(state, { data }) {
    state.data = data;
  },
};

const actions = {
  async getData({ commit }) {
    const getDataRes = await api.getData({ type: 'stats' });
    const data = getDataRes.success ? Object.freeze(getDataRes.payload) : {};
    commit('SET_DATA', { data: data });
    return getDataRes;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
