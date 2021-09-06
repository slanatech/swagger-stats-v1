<template>
  <div class="h-full">
    <trace-viewer></trace-viewer>
    <perspective :data="perspectiveData" :schema="schema" />
  </div>
</template>
<script>
  import { defineComponent } from 'vue';
  import Perspective from '@/components/Perspective.vue';
  import { mapState, mapActions } from 'vuex';

  // w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start

  export default defineComponent({
    components: { Perspective },
    data() {
      return {
        schema: Object.freeze({}),
      };
    },
    computed: {
      ...mapState({
        refresh: (state) => state.layout.refresh,
        perspectiveData: (state) => state.data.data,
      }),
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
      ...mapActions({
        getData: 'data/getData',
        setProgress: 'layout/setProgress',
      }),
      async handleLoad() {
        //this.setProgress({progress: true});
        //await this.getData();
        //this.setProgress({progress: false});
      },
    },
  });
</script>
