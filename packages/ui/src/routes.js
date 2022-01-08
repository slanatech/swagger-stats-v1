//import Admin from './layouts/Admin.vue';
import BaseLayout from './layouts/BaseLayout.vue';
import NotFound from './views/NotFound.vue';
import Perspective from './views/Perspective.vue';
import SpansView from './views/SpansView.vue';
import SpansErrorsView from './views/SpansErrorsView.vue';
import Test from './views/Test.vue';

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  { path: '/', redirect: '/ux/perspective' },
  {
    path: '/ux/test',
    component: Test,
    name: 'test',
  },
  {
    path: '/ux/perspective',
    component: BaseLayout,
    redirect: '/ux/perspective',
    children: [
      {
        path: '/ux/perspective',
        component: Perspective,
        name: 'perspective',
      },
    ],
  },
  {
    path: '/ux/spans',
    component: BaseLayout,
    redirect: '/ux/spans',
    children: [
      {
        path: '/ux/spans',
        component: SpansView,
        name: 'spans',
      },
      {
        path: '/ux/spans/errors',
        component: SpansErrorsView,
        name: 'spanserrors',
      },
    ],
  },
  { path: '/:path(.*)', component: NotFound },
];
