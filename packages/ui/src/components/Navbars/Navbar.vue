<template>
  <nav class="relative z-40 flex flex-wrap items-center justify-between px-2 py-3 bg-black">
    <div class="container px-4 mx-auto flex flex-wrap items-center justify-between">
      <div class="w-full relative flex justify-between lg:w-auto px-4 lg:static lg:block lg:justify-start">
        <div class="relative flex items-center justify-between">
          <a class="text-sm font-bold leading-relaxed mr-4 py-2 whitespace-nowrap uppercase text-white justify-start opacity-75"> SWSAA </a>
        </div>
        <button class="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none" type="button" @click="toggleNavbar()">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <div :class="{ hidden: !showMenu, flex: showMenu }" class="lg:flex lg:flex-grow items-center">
        <ul class="flex flex-col lg:flex-row list-none ml-auto">
          <li class="nav-item">
            <router-link to="/swsux/test">
              <a class="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75"> <i class="fas fa-server text-lg leading-lg text-white" /><span class="ml-2">Test</span> </a>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/swsux/perspective">
              <a v-bind:class="{ 'opacity-60': !perspectiveActive, 'opacity-100': perspectiveActive }" class="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                <!--<i class="fas fa-server text-lg leading-lg text-white" /><span class="ml-2">Perspective</span>-->
                <BeakerIcon class="h-5 w-5" /><span class="ml-2">Perspective</span>
              </a>
            </router-link>
          </li>
          <!--<li class="nav-item">
                        <button
                                class="bg-green-500 text-white active:bg-green-800 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
                                type="button"
                                @click="handleRefresh"
                        >
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </li>-->
          <li class="nav-item">
            <button
              class="bg-green-500 text-white active:bg-green-800 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150"
              type="button"
              @click="handleDownload"
            >
              <i class="fas fa-cloud-download-alt"></i> Download
            </button>
          </li>
          <!--<li class="nav-item">
                        <a class="px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">
                            <i class="fab fa-pinterest text-lg leading-lg text-white opacity-75" /><span class="ml-2">Pin</span>
                        </a>
                    </li>-->
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { mapActions } from 'vuex';
  import { BeakerIcon } from '@heroicons/vue/solid';

  export default defineComponent({
    name: 'Navbar',
    components: { BeakerIcon },
    data() {
      return {
        showMenu: false,
      };
    },
    computed: {
      currentRouteName(): string {
        return this.$route.name;
      },
      perspectiveActive() {
        return this.currentRouteName === 'perspective';
      },
    },
    methods: {
      ...mapActions({
        setRefresh: 'layout/setRefresh',
      }),
      toggleNavbar: function () {
        this.showMenu = !this.showMenu;
      },
      handleRefresh: function () {
        this.setRefresh();
      },
      handleDownload: function () {
        console.log(`TO BE IMPLEMENTED`);
      },
    },
  });
</script>
