<template>
  <!-- See https://web.dev/one-line-layouts/ -->
  <div class="grid grid-rows-2 grid-cols-2" style="grid-template-rows: 4rem 1fr; grid-template-columns: auto 1fr">
    <div class="col-span-2">
      <navbar-ext></navbar-ext>
      <progress-bar :progress="progress"></progress-bar>
    </div>

    <!--<div v-if="true" class="bg-blue-300 sticky" style="top: 4rem; height: calc(100vh - 4rem)">-->
    <div v-if="true" class="bg-blue-300 sticky" style="top: 4rem; height: calc(100vh - 4rem)">
      <!-- Sidebar -->
      <div class="h-full md:w-60 w-0" style="overflow-y: auto">
        <div>
          <div>Sidebar</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
          <div>Menu</div>
        </div>
      </div>
    </div>

    <main class="bg-gray-500">
      <router-view />
    </main>
  </div>

  <!--
  <main class="w-full grid" style="height: 100vh; grid-template-rows: auto 1fr">
    <div>
      <navbar-ext></navbar-ext>
      <progress-bar :progress="progress"></progress-bar>
    </div>
    <div>
      <router-view />
    </div>
  </main>
  -->
</template>
<script>
  //import Navbar from '@/components/Navbars/Navbar.vue';
  import NavbarExt from '@/components/Navbars/NavbarExt.vue';
  import ProgressBar from '@/components/Progress.vue';
  import wsConnection from '../store/wsconnection';
  import { defineComponent } from 'vue';
  import { mapState } from 'vuex';

  export default defineComponent({
    name: 'BaseLayout',
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
