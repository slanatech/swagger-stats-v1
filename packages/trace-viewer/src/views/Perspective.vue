<template>
  <div class="h-full">OPA</div>
</template>
<script>
  import { defineComponent } from 'vue';

  // w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start

  export default defineComponent({
    components: {},
    data() {
      return {
        schema: Object.freeze({}),
      };
    },
    computed: {
      currentRouteName() {
        return this.$route.name;
      },
    },
    watch: {
      refresh: {
        handler: async function () {
          this.handleLoad();
        },
      },
    },
    async mounted() {
      this.handleLoad();
    },
    methods: {
      async handleLoad() {
        //this.setProgress({progress: true});
        //await this.getData();
        //this.setProgress({progress: false});
      },
    },
  });
</script>
