import Admin from './layouts/Admin.vue';
import NotFound from './views/NotFound.vue';
import Perspective from './views/Perspective.vue';
import Test from './views/Test.vue';

/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [
  { path: '/', redirect: '/admin/perspective' },
  {
    path: '/admin',
    component: Admin,
    redirect: '/admin/perspective',
    children: [
      {
        path: '/admin/perspective',
        component: Perspective,
        name: 'perspective',
      },
      {
        path: '/admin/test',
        component: Test,
        name: 'test',
      },
    ],
  },
  { path: '/:path(.*)', component: NotFound },
];
