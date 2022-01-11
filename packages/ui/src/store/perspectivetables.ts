/*
 * Perspective tables
 */
//import { pathOr } from 'ramda';
// @ts-ignore
import { bus } from '@/store/bus';
import { spanSchema } from '@swaggerstats/core';
import { spanTransforms } from '@swaggerstats/core';

const MOVIES_URL = 'https://vega.github.io/editor/data/movies.json';

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
    let t = null;
    switch (tableName) {
      case 'spans': {
        t = await this.initSpansTable();
        break;
      }
      case 'movies': {
        t = await this.initMoviesTable();
        break;
      }
    }
    this.tables[tableName] = t;
    return t;
  }

  // TEMP, just for testing TODO remove
  async initMoviesTable(): Promise<any> {
    const request = fetch(MOVIES_URL);
    const response = await request;
    const json = await response.json();
    for (const row of json) {
      row['Release Date'] = row['Release Date'] ? new Date(row['Release Date']) || null : null;
    }
    const SCHEMA = {
      Title: 'string',
      'US Gross': 'float',
      'Worldwide Gross': 'float',
      'US DVD Sales': 'float',
      'Production Budget': 'float',
      'Release Date': 'date',
      'MPAA Rating': 'string',
      'Running Time min': 'integer',
      Distributor: 'string',
      Source: 'string',
      'Major Genre': 'string',
      'Creative Type': 'string',
      Director: 'string',
      'Rotten Tomatoes Rating': 'integer',
      'IMDB Rating': 'float',
      'IMDB Votes': 'integer',
    };
    const table = await this.worker.table(SCHEMA);
    table.update(json);
    return table;
  }

  async initSpansTable(): Promise<any> {
    const tableSchema = spanSchema.toPerspectiveSchema();
    const table = await this.worker.table(tableSchema, { index: 'spanId' });
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
