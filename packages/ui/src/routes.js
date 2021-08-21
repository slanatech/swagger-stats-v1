import Admin from './layouts/Admin.vue';
import NotFound from './views/NotFound.vue';
import Perspective from './views/Perspective.vue';
import Test from './views/Test.vue';

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  { path: '/', redirect: '/sws/perspective' },
  {
    path: '/sws',
    component: Admin,
    redirect: '/sws/perspective',
    children: [
      {
        path: '/sws/perspective',
        component: Perspective,
        name: 'perspective',
      },
      {
        path: '/sws/test',
        component: Test,
        name: 'test',
      },
    ],
  },
  { path: '/:path(.*)', component: NotFound },
];
