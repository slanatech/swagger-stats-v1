<template>
  <div>TRACE-VIEWER CUSTOM ELEMENT</div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'TraceViewerComponent',
    props: {
      progress: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        progressValue: 57,
      };
    },
    watch: {
      progress: {
        handler: function () {
          console.log(`progress: data changed: ${this.progress}`);
          this.showProgress();
        },
      },
    },
    async mounted() {
      this.showProgress();
    },
    methods: {
      showProgress() {
        let v = parseFloat(this.progress);
        if (!isNaN(v)) {
          this.progressValue = v;
          return;
        }
        if (!this.progress) {
          return;
        }
        this.progressValue = 0;
      },
    },
  });
</script>
