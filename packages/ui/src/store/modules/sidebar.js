const allSidebarItems = {
  '/ux/perspective': [
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
  ],
  '/ux/spans': [{ title: 'Alternative', link: '/', icon: 'chart-bar' }],
};

function getSidebarItemsByRoutePath(routePath) {
  const paths = Object.keys(allSidebarItems);
  for (let i = 0; i < paths.length; i++) {
    const pkey = paths[i];
    if (routePath.startsWith(pkey)) {
      return allSidebarItems[pkey];
    }
  }
  return [];
}

const state = {
  routePath: '',
  items: [],
};

const getters = {};

const mutations = {
  SET_ROUTE_PATH(state, { routePath }) {
    console.log(`Store:sidebar: set new routePath ${routePath}`);
    const opa = getSidebarItemsByRoutePath(routePath); //altSidebarItems;
    state.items = opa;
    state.routePath = routePath;
  },
};

const actions = {
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
