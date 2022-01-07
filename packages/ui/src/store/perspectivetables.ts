/*
 * Perspective tables
 */
//import { pathOr } from 'ramda';
// @ts-ignore
import { bus } from '@/store/bus';
import { spanTransforms } from '@swaggerstats/core';

class PerspectiveTables {
  public worker: any | null;
  public table: any | null;

  private tables: any;

  constructor() {
    // @ts-ignore
    this.worker = perspective.worker();
    this.table = null;
    this.tables = {};
    bus.on('span', async (e: any) => {
      await this.handleSpan(e);
    });
  }

  async getTable(tableName: string): Promise<any> {
    if (tableName in this.tables) {
      return this.tables[tableName];
    }
    // TODO switch by name
    const t = await this.initSpansTable();
    this.tables[tableName] = t;
    return t;
  }

  async initSpansTable(): Promise<any> {
    const table = await this.worker.table(
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
    return table;
  }
  async handleSpan(span: any) {
    console.log(`SpanView: Got Span: ${JSON.stringify(span)}`);
    const t = await this.getTable('spans');
    const flatSpan = spanTransforms.flatten(span);
    t.update([flatSpan]);
  }
}

const perspectiveTables = new PerspectiveTables();
export { perspectiveTables };
