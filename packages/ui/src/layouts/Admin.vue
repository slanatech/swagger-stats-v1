<template>
  <!-- See https://web.dev/one-line-layouts/ -->
  <main class="w-full grid" style="height: 100vh; grid-template-rows: auto 1fr;">
    <div>
      <navbar></navbar>
      <progress-bar :progress="progress"></progress-bar>
    </div>
    <div>
      <router-view/>
    </div>
  </main>
</template>
<script>
import Navbar from "@/components/Navbars/Navbar.vue";
import ProgressBar from "@/components/Progress.vue";
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
  name: 'AdminLayout',
  components: { Navbar, ProgressBar },
  data(){
  },
  computed: {
    ...mapState({
      progress: state => state.layout.progress
    }),
  },
  methods:{
  }
})
</script>
