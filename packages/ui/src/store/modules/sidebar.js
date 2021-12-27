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

const altSidebarItems = [{ title: 'Alternative', link: '/', icon: 'chart-bar' }];

const state = {
  items: defaultSidebarItems,
  routePath: '',
};

const getters = {};

const mutations = {
  SET_DARK(state, { dark }) {
    localStorage['sws-dark-mode'] = dark;
    state.dark = dark;
  },
  SET_ROUTE_PATH(state, { routePath }) {
    console.log(`Store:sidebar: set new routePath ${routePath}`);
    state.routePath = routePath;
    state.items = altSidebarItems;
  },
};

const actions = {
  setDark({ commit }, { dark }) {
    commit('SET_DARK', { dark: dark });
  },
  setRoutePath({ commit }, { routePath }) {
    commit('SET_ROUTE_PATH', { routePath: routePath });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
