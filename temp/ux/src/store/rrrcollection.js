/* Collection of Request Response Records captured for detailed view in UI
 */
const state = () => {
  return {
    items: [],
    expanded: []
  };
};

/*
const state = {
  items: [],
  expanded: []
};
*/

const getters = {};

const mutations = {
  ADD(state, { key, data }) {
    state.items.unshift({ key: key, data: data });
  },
  REMOVE(state, { index }) {
    state.items.splice(index, 1);
  },
  SET_EXPANDED(state, { expanded }) {
    state.expanded = [...expanded];
  }
};

const actions = {
  add({ commit }, { key, data }) {
    commit('ADD', { key: key, data: data });
  },
  remove({ commit }, { index }) {
    commit('REMOVE', { index: index });
  },
  setExpanded({ commit }, { expanded }) {
    commit('SET_EXPANDED', { expanded: expanded });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
