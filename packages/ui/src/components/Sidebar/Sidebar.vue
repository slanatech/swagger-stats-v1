<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="md:w-60 sm:w-20 w-0">
    <div v-if="['sm', 'md', 'lg', 'xl'].includes(breakpoints.is)">
      <div>{{ breakpoints.is }}</div>
      <sidebar-items-renderer :items="sidebarItems" :breakpoint="breakpoints.is"></sidebar-items-renderer>
      <!--
      <router-link v-for="item in sidebarItems" :key="item.name" :to="item.link" class="-m-3 p-2 flex items-start rounded-lg hover:bg-gray-50">
        <mdicon :name="item.icon" class="flex-shrink-0 h-6 w-6 text-indigo-600" aria-hidden="true"></mdicon>
        <div v-if="['md', 'lg', 'xl'].includes(breakpoints.is)" class="ml-4">
          <p class="text-base font-medium text-gray-900">
            {{ item.title }}
          </p>
        </div>
      </router-link>
      -->
    </div>
  </div>
</template>

<script lang="js">
  //import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/vue';
  //import { BookmarkAltIcon, CalendarIcon, ChartBarIcon, CursorClickIcon, MenuIcon, PhoneIcon, PlayIcon, RefreshIcon, ShieldCheckIcon, SupportIcon, ViewGridIcon, XIcon } from '@heroicons/vue/outline';
  //import { ChevronDownIcon } from '@heroicons/vue/solid';

  import { useRoute } from 'vue-router';
  import { ref, watch, computed } from 'vue';
  import { useStore } from 'vuex'
  import useBreakpoint from "../../hooks/useBreakpoint";
  import SidebarItemsRenderer from '@/components/Sidebar/SidebarItemsRenderer.vue';

  export default {
    components: {
      SidebarItemsRenderer
    },
    /*
    props: {
      items: {
        type: Array,
        default: () => [],
      },
    },*/
    setup() {
      const route = useRoute();
      const store = useStore();
      const { breakpoints } = useBreakpoint();
      const currentRoute = ref();
      watch(
        () => route.path,
        (newPath) => {
          currentRoute.value = newPath;
          store.dispatch('sidebar/setRoutePath', {routePath:newPath});
          console.log(`WATCH: newPath=${newPath}`);
        }
      );
      console.log(`Current breakpoints: ${JSON.stringify(breakpoints)}`)
      return {
        route,
        currentRoute,
        breakpoints,
        sidebarItems: computed(() => store.state.sidebar.items)
      };
    },
    watch:{
      currentRoute: {
        handler: function (newRoute) {
          console.log(`WATCH 2: new route ${newRoute}`);
        }
      },
      is: {
        handler: function () {
          console.log(`WATCH 3: new breakpoint ${this.is}`);
        }
      }
    },
    mounted() {
      this.$store.dispatch('sidebar/setRoutePath', {routePath:this.route.path});
      console.log(`Sidebar mounted, ${this.sidebarItems.length} menu items, routePath: ${this.route.path}, breakpoints: ${JSON.stringify(this.breakpoints)}`);
      //console.log(`sidebarItems: ${JSON.stringify(this.sidebarItems)}`);
    },
  };
</script>
