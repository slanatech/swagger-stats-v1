import Admin from './layouts/Admin.vue';
import NotFound from './views/NotFound.vue';
import Perspective from './views/Perspective.vue';

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
    ],
  },
  { path: '/:path(.*)', component: NotFound },
];
