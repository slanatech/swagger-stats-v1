<template>
  <!-- See https://web.dev/one-line-layouts/ -->
  <main class="w-full grid" style="height: 100vh; grid-template-rows: auto 1fr">
    <div>
      <navbar-ext></navbar-ext>
      <progress-bar :progress="progress"></progress-bar>
    </div>
    <div>
      <router-view />
    </div>
  </main>
</template>
<script>
  //import Navbar from '@/components/Navbars/Navbar.vue';
  import NavbarExt from '@/components/Navbars/NavbarExt.vue';
  import ProgressBar from '@/components/Progress.vue';
  import wsConnection from '../store/wsconnection';
  import { defineComponent } from 'vue';
  import { mapState } from 'vuex';

  export default defineComponent({
    name: 'AdminLayout',
    components: { NavbarExt, ProgressBar },
    data() {
      return {};
    },
    computed: {
      ...mapState({
        progress: (state) => state.layout.progress,
      }),
    },
    mounted() {
      // Initialize ws connection to backend once main layout is mounted
      wsConnection.init();
    },
    methods: {},
  });
</script>
