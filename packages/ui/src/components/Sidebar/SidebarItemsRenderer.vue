<!-- This example requires Tailwind CSS v2.0+ -->
<template>
  <div class="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
    <router-link v-for="item in items" :key="item.name" :to="item.link" class="-m-3 p-2 flex items-start rounded-lg hover:bg-gray-50">
      <!--<component :is="item.icon" class="flex-shrink-0 h-6 w-6 text-indigo-600" aria-hidden="true" />-->
      <mdicon :name="item.icon" class="flex-shrink-0 h-6 w-6 text-indigo-600" aria-hidden="true"></mdicon>
      <div v-if="['md', 'lg', 'xl'].includes(breakpoint)" class="ml-4">
        <p class="text-base font-medium text-gray-900">
          {{ item.title }}
        </p>
        <!--<p class="mt-1 text-sm text-gray-500">
            {{ item.description }}
          </p>-->
      </div>
    </router-link>
  </div>
</template>

<script lang="js">
  export default {
    components: {},
    props: {
      items: {
        type: Array,
        default: () => [],
      },
      breakpoint: {
        type: String,
        default: 'md',
      },
    },
    setup() {
      return {};
    },
    mounted() {
      console.log(`Sidebar Items Renderer mounted, ${this.items.length} items`);
    },
  };
</script>
