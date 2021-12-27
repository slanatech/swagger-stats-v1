const defaultSidebarItems = [
  { title: 'Summary', link: '/', icon: 'chart-bar' },
  { title: 'Requests', link: '/requests', icon: 'swap-horizontal' },
  { title: 'Errors', link: '/errors', icon: 'alert-circle' },
  { title: 'API', link: '/api', icon: 'xml' },
  { title: 'API Operation', link: '/apiop', icon: 'code-tags' },
  { title: 'API Responses', link: '/apiresponses', icon: 'chart-pie' },
  { title: 'Rates & Durations', link: '/rates', icon: 'clock-outline' },
  { title: 'Payload', link: '/payload', icon: 'swap-vertical' },
  { title: 'Last Errors', link: '/lasterrors', icon: 'alert-circle' },
  { title: 'Longest Requests', link: '/longestrequests', icon: 'timer-sand-empty' },
];

const state = {
  items: defaultSidebarItems,
};

const getters = {};

const mutations = {
  SET_DARK(state, { dark }) {
    localStorage['sws-dark-mode'] = dark;
    state.dark = dark;
  },
};

const actions = {
  setDark({ commit }, { dark }) {
    commit('SET_DARK', { dark: dark });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
