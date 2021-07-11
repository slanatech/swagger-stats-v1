<template>
    <div class="h-full">
      <db-chord :data="chordData"></db-chord>
    </div>
</template>
<script>
import { defineComponent } from 'vue'
import DbChord from '@/components/db/DbChord.vue'
import {mapState, mapActions} from 'vuex';

import testChordData from '@/data/chorddata.json';

export default defineComponent({
  name: "Test",
  components: { DbChord },
  data(){
    return {
      horizonData: this.generateHorizonData(),
      chordData: testChordData
    }
  },
  computed: {
    ...mapState({
      refresh: state => state.layout.refresh,
    }),
    currentRouteName() {
      return this.$route.name;
    }
  },
  watch: {
    refresh: {
      handler: async function() {
        this.handleLoad();
      }
    }
  },
  async mounted() {
    this.handleLoad();
  },
  methods:{
    ...mapActions({
      getData: 'data/getData',
      setProgress: 'layout/setProgress'
    }),
    async handleLoad(){
    },
    generateHorizonData() {
      let chartData = [];
      let valuesS1 = [];
      let valuesS2 = [];
      let sTS = Date.now() - 100 * 3600 * 1000;
      for (let i = 0; i < 100; i++) {
        let cTs = sTS + i * 3600 * 1000;
        let d = new Date(cTs);
        valuesS1.push({ date: d, value: Math.random() });
        valuesS2.push({ date: d, value: Math.random() });
      }
      chartData.push({ key: 'Series 1', values: valuesS1 });
      chartData.push({ key: 'Series 2', values: valuesS2 });
      return chartData;
    }
  }
})
</script>

