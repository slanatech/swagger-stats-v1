//import Admin from './layouts/Admin.vue';
import BaseLayout from './layouts/BaseLayout.vue';
import NotFound from './views/NotFound.vue';
import Perspective from './views/Perspective.vue';
import SpansView from './views/SpansView.vue';
import Test from './views/Test.vue';

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  { path: '/', redirect: '/ux/perspective' },
  {
    path: '/ux',
    component: BaseLayout,
    redirect: '/ux/spans',
    children: [
      {
        path: '/ux/spans',
        component: SpansView,
        name: 'spans',
      },
      {
        path: '/ux/perspective',
        component: Perspective,
        name: 'perspective',
      },
      {
        path: '/ux/test',
        component: Test,
        name: 'test',
      },
    ],
  },
  { path: '/:path(.*)', component: NotFound },
];
