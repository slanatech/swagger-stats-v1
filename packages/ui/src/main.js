import { createApp } from 'vue';
import { store } from './store/store';
import './tailwind.css';
import App from './App.vue';
import { routes } from './routes.js';
import { createRouter, createWebHistory } from 'vue-router';

// Consider: https://halilyuce.com/web/how-to-add-font-awesome-to-your-vue-3-project-typescript/
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@fortawesome/fontawesome-free/js/all.min.js';

let app = createApp(App);

let router = createRouter({
  history: createWebHistory(),
  routes: import.meta.hot ? [] : routes,
});

if (import.meta.hot) {
  let removeRoutes = [];

  for (let route of routes) {
    removeRoutes.push(router.addRoute(route));
  }

  import.meta.hot.accept('./routes.js', ({ routes }) => {
    for (let removeRoute of removeRoutes) removeRoute();
    removeRoutes = [];
    for (let route of routes) {
      removeRoutes.push(router.addRoute(route));
    }
    router.replace('');
  });
}

app.use(router);
app.use(store);
app.mount('#app');
