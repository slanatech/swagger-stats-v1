import { createStore } from 'vuex'
import data from '@/store/data';
import layout from '@/store/layout';

export const store = createStore({
  state: {
  },
  modules: {
    data,
    layout
  },
  mutations: {
  },
  actions: {
  }
});
