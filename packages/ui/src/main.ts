import { createApp } from 'vue';
// @ts-ignore
import { store } from '@/store/store';
import './tailwind.css';
import App from './App.vue';
// @ts-ignore
import { routes } from '@/routes.js';
import { createRouter, createWebHistory } from 'vue-router';

// Consider: https://halilyuce.com/web/how-to-add-font-awesome-to-your-vue-3-project-typescript/
//import '@fortawesome/fontawesome-free/css/all.min.css';
//import '@fortawesome/fontawesome-free/js/all.min.js';

import '@finos/perspective-viewer';

import mdiVue from 'mdi-vue/v3';
import * as mdijs from '@mdi/js';

// @ts-ignore
import { registerTraceViewer } from '@swaggerstats/trace-viewer';

const app = createApp(App);

const router = createRouter({
  history: createWebHistory('/'),
  routes: import.meta.hot ? [] : routes,
});

if (import.meta.hot) {
  let removeRoutes: any[] = [];

  for (const route of routes) {
    removeRoutes.push(router.addRoute(route));
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import.meta.hot.accept('./routes.js', ({ routes }) => {
    for (const removeRoute of removeRoutes) removeRoute();
    removeRoutes = [];
    for (const route of routes) {
      removeRoutes.push(router.addRoute(route));
    }
    router.replace('');
  });
}

registerTraceViewer();

// MDI icons, see
// https://github.com/therufa/mdi-vue
app.use(mdiVue, {
  icons: mdijs,
});

app.use(router);
app.use(store);
app.mount('#app');
