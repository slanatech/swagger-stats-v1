<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="md:w-60 w-0">
    <div class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
      <router-link v-for="item in items" :key="item.name" :to="item.link" class="-m-3 p-2 flex items-start rounded-lg hover:bg-gray-50">
        <!--<component :is="item.icon" class="flex-shrink-0 h-6 w-6 text-indigo-600" aria-hidden="true" />-->
        <mdicon :name="item.icon" class="flex-shrink-0 h-6 w-6 text-indigo-600" aria-hidden="true"></mdicon>
        <div v-if="true" class="ml-4">
          <p class="text-base font-medium text-gray-900">
            {{ item.title }}
          </p>
          <!--<p class="mt-1 text-sm text-gray-500">
            {{ item.description }}
          </p>-->
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="js">
  //import { Popover, PopoverButton, PopoverGroup, PopoverPanel } from '@headlessui/vue';
  //import { BookmarkAltIcon, CalendarIcon, ChartBarIcon, CursorClickIcon, MenuIcon, PhoneIcon, PlayIcon, RefreshIcon, ShieldCheckIcon, SupportIcon, ViewGridIcon, XIcon } from '@heroicons/vue/outline';
  //import { ChevronDownIcon } from '@heroicons/vue/solid';

  import { useRoute } from 'vue-router';
  import { ref, watch } from 'vue';

  export default {
    components: {},
    props: {
      items: {
        type: Array,
        default: () => [],
      },
    },
    setup() {
      const route = useRoute();
      const currentRoute = ref();
      watch(
        () => route.path,
        async (newPath) => {
          currentRoute.value = newPath;
          console.log(`WATCH: newPath=${newPath}`);
        }
      );
      return { route };
    },
    mounted() {
      console.log(`Sidebar mounted, ${this.items.length} menu items, routePath: ${this.route.path}`);
    },
  };
</script>
