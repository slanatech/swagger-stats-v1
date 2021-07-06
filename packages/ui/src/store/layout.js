const state = {
  dark: (localStorage['sws-dark-mode'] || 'false') === 'true',
  progressbar: false,
  refresh: 0,
};

const getters = {};

const mutations = {
  SET_DARK(state, { dark }) {
    localStorage['sws-dark-mode'] = dark;
    state.dark = dark;
  },
  SET_PROGRESS(state, { progress }) {
    state.progress = progress;
  },
  SET_REFRESH(state) {
    state.refresh = Date.now();
  },
};

const actions = {
  setDark({ commit }, { dark }) {
    commit('SET_DARK', { dark: dark });
  },
  // Can pass true (show auto), false (hide), or number (show with %%)
  setProgress({ commit }, { progress = false }) {
    commit('SET_PROGRESS', { progress: progress });
  },
  setRefresh({ commit }) {
    commit('SET_REFRESH');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
