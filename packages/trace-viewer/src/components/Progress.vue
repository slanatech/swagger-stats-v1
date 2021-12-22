<template>
  <div v-if="progress" class="top-0 fixed z-50 w-full ease-linear transition-all duration-200">
    <div class="overflow-hidden h-2 text-xs flex bg-green-800">
      <div :style="`width:${progressValue}%`" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 ease-linear transition-all duration-200"></div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'ProgressBar',
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
        intervalId: 0,
      };
    },
    watch: {
      progress: {
        handler: function () {
          if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = 0;
          }
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
        this.intervalId = setInterval(() => {
          this.progressValue += 10;
          if (this.progressValue > 100) {
            this.progressValue = 0;
          }
          console.log(`Progress = ${this.progressValue}`);
        }, 200);
      },
    },
  });
</script>
