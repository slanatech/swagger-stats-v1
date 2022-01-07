// Sample of configuring perspective views // https://bl.ocks.org/texodus/803de90736a3641ad91c5c7a1b49d0a7
<template>
  <div class="h-full">
    <perspective-viewer style="width: 100%; height: 100%; resize: vertical" class="perspective-viewer-material" />
  </div>
</template>
<script lang="js">
  import { defineComponent } from 'vue';
  import { mapState, mapActions } from 'vuex';
  import { bus } from '@/store/bus';
  import { spanTransforms } from '@swaggerstats/core';
  import { perspectiveTables } from '@/store/perspectivetables';

  // w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start

  export default defineComponent({
    components: {},
    data() {
      return {
        worker: null,
        table: null,
        table2: null,
        schema: Object.freeze({}),
        idx: 0,
        testSpanId: '',
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
      bus.on('span', async (e) => {
        await this.handleSpan(e);
      });
      this.initialize();
    },
    methods: {
      ...mapActions({
        getData: 'data/getData',
        setProgress: 'layout/setProgress',
      }),
      async initialize() {
        /*
        this.worker = perspective.worker();
        this.table = await this.worker.table(
          {
            spanId: 'string',
            traceId: 'string',
            parentSpanId: 'string',
            service: 'string',
            kind: 'string',
            category: 'string',
            success: 'boolean',
            name: 'string',
            startTime: 'datetime',
            endTime: 'datetime',
            duration: 'integer',
            //attributes: 'object',
            'http.url': 'string',
          },
          { index: 'spanId' }
        );
         */
        //this.table = await this.worker.table([{ spanId: 'a' }], { index: 'spanId' });
        //let schema = this.worker.table.get_schema();
        //let types = schema.types();
        //let schema = await this.table.schema();
        //let types = schema.types();
        const el = document.getElementsByTagName('perspective-viewer')[0];
        const spansTable = await perspectiveTables.getTable('spans');
        el.load(spansTable);
        el.toggleConfig();
      },
      async handleSpan(span) {
        return;
        console.log(`SpanView: Got Span: ${this.idx} ${JSON.stringify(span)}`);
        if (this.idx === -1) {
          // This way we can update schema of the table - by re-creating it and re-loading data
          // TODO Best to have schema for Spans and Traces pre-defined with reasonable subset of common props / attributes
          //let tableSchema = await this.table.schema();
          let schema2 = { traceId: 'string', spanId: 'string', name: 'string' };
          //let table2 = await this.worker.table(tableSchema);
          const view = await this.table.view();
          const arrowData = await view.to_arrow();
          this.table = await this.worker.table(schema2);
          const el = document.getElementsByTagName('perspective-viewer')[0];
          el.load(this.table);
          this.table.update(arrowData);
          this.table.update([span]);
        }
        //this.table.update([{ traceId: span.traceId, test: 1 }]);
        // Test updating row
        if (this.idx === -2) {
          // 0
          this.testSpanId = span.spanId;
        }
        //const opa = new DataSource();
        //console.log(`ds: ${opa.id}`);
        const flatSpan = spanTransforms.flatten(span);
        this.table.update([flatSpan]);
        if (this.idx === -11) {
          // 11
          //this.table.update({ spanId: [this.testSpanId], name: ['opa'] });
          span.spanId = this.testSpanId;
          span.name = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
          // !!! this
          this.table.update([span]);
          //this.table.update({ spanId: [this.testSpanId], name: ['OPAAAAAAAAAAAAAAAAAAAA'] });
        }
        this.idx++;
      },
    },
  });
</script>
