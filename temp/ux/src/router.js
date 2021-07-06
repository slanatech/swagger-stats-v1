import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store/store';
import api from '@/store/api';
import DefaultLayout from './layouts/Default.vue';
import Summary from './views/summary.vue';
import Rates from './views/rates.vue';
import Api from './views/api.vue';
import ApiOp from './views/apiop.vue';
import ApiResponses from './views/apiresponses.vue';
import Requests from './views/requests.vue';
import Errors from './views/errors.vue';
import LastErrors from './views/lasterrors.vue';
import LongestRequests from './views/longestrequests.vue';
import Payload from './views/payload.vue';
import Login from './pages/login.vue';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'summary',
          component: Summary
        },
        {
          path: '/rates',
          name: 'rates',
          component: Rates
        },
        {
          path: '/requests',
          name: 'requests',
          component: Requests
        },
        {
          path: '/api',
          name: 'api',
          component: Api
        },
        {
          path: '/apiop',
          name: 'apiop',
          component: ApiOp
        },
        {
          path: '/apiresponses',
          name: 'apiresponses',
          component: ApiResponses
        },
        {
          path: '/lasterrors',
          name: 'lasterrors',
          component: LastErrors
        },
        {
          path: '/longestrequests',
          name: 'longestrequests',
          component: LongestRequests
        },
        {
          path: '/payload',
          name: 'payload',
          component: Payload
        },
        {
          path: '/errors',
          name: 'errors',
          component: Errors
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (store.state.authenticated || to.name === 'login') {
    next();
    return;
  }

  let authResult = await api.authenticate();
  if (!authResult.success) {
    store.commit('SET_AUTH', { authenticated: false });
    next('/login');
    return;
  }
  let loggedin = false;
  if (authResult.headers && 'x-sws-authenticated' in authResult.headers && authResult.headers['x-sws-authenticated']) {
    loggedin = true;
  }
  store.commit('SET_AUTH', { authenticated: true, loggedin: loggedin });
  next();
});

export default router;
