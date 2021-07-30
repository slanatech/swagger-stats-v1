// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/* eslint-disable jest/no-standalone-expect */

import './jest-extensions';
import { zip } from 'ix/iterable';
import * as generate from './generate-test-data';
// @ts-ignore
import { validateTable } from './generated-data-validators';
// @ts-ignore
import { Table, Schema, Field, DataType, Int32, Float32, Utf8, DataFrame } from 'apache-arrow';

const toSchema = (...xs: [string, DataType][]) => new Schema(xs.map((x) => new Field(...x)));
const schema1 = toSchema(['a', new Int32()], ['b', new Float32()], ['c', new Utf8()]);
// @ts-ignore
const partialOverlapWith1 = toSchema(['a', new Int32()], ['b', new Float32()], ['f', new Utf8()]);
// @ts-ignore
const schema2 = toSchema(['d', new Int32()], ['e', new Float32()], ['f', new Utf8()]);
const schema3 = toSchema(['a', new Int32()], ['b', new Float32()], ['c', new Int32()]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-ignore
const getMarkdown = (dataFrame: DataFrame): string => {
  let markdown = `${dataFrame.schema.fields.join(' | ')}\n`;
  markdown += dataFrame.schema.fields.map(() => ' --- ').join('|');
  for (const row of dataFrame) {
    markdown += '\n ';
    for (const cell of row) {
      markdown += ` ${cell[1]} |`;
    }
  }
  return markdown;
};

describe('Table.assign()', () => {
  it(`should concatenate tables`, () => {
    const t1hs = generate.table([1], schema1);
    //console.log('Table 1:\n' + getMarkdown(t1hs.table));
    const t2hs = generate.table([3], schema1);
    //console.log('Table 2:\n' + getMarkdown(t2hs.table));
    const table = t1hs.table.concat(t2hs.table);
    //console.log('Table 3:\n' + getMarkdown(table));
    //const table2 = table.slice(1, 2);
    //console.log('Table 4:\n' + getMarkdown(table2));
    //const f = assignGeneratedTables(lhs, rhs);
    expect(table.schema.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);
    //validateTable({ ...f([0, 1, 2], [3, 4, 5]), table }).run();
  });

  it(`should create large table`, () => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    const t1hs = generate.table([100000], schema3);
    expect(t1hs.table.schema.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);
    const used2 = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used2 * 100) / 100} MB`);
    //validateTable({ ...f([0, 1, 2], [3, 4, 5]), table }).run();
  });

  it(`should add large number of rows`, () => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

    const t1hs = generate.table([1], schema3);
    let table = t1hs.table;
    expect(table.schema.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);

    for (let i = 0; i < 100000; i++) {
      const t2 = generate.table([1], schema3);
      table = table.concat(t2.table);
    }

    // @ts-ignore
    //const table2 = new Table(schema3, table._chunks);
    //const table2 = Table.from(table.serialize());
    //expect(table2.schema.fields.map((f) => f.name)).toEqual(['a', 'b', 'c']);

    //console.log('Table:\n' + getMarkdown(table));

    const used2 = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used2 * 100) / 100} MB`);
    //validateTable({ ...f([0, 1, 2], [3, 4, 5]), table }).run();
  });

  /*
  describe.skip(`should assign non-overlapping fields`, () => {
    const lhs = generate.table([20], schema1);
    const rhs = generate.table([20], schema2);
    const table = lhs.table.assign(rhs.table);
    const f = assignGeneratedTables(lhs, rhs);
    expect(table.schema.fields.map((f) => f.name)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    validateTable({ ...f([0, 1, 2], [3, 4, 5]), table }).run();
  });
  describe.skip(`should assign partially-overlapping fields`, () => {
    const lhs = generate.table([20], schema1);
    const rhs = generate.table([20], partialOverlapWith1);
    const table = lhs.table.assign(rhs.table);
    const f = assignGeneratedTables(lhs, rhs);
    expect(table.schema.fields.map((f) => f.name)).toEqual(['a', 'b', 'c', 'f']);
    // eslint-disable-next-line no-sparse-arrays
    validateTable({ ...f([, , 2], [0, 1, 3]), table }).run();
  });
  describe.skip(`should assign completely-overlapping fields`, () => {
    const lhs = generate.table([20], schema2);
    const rhs = generate.table([20], schema2);
    const table = lhs.table.assign(rhs.table);
    const f = assignGeneratedTables(lhs, rhs);
    expect(table.schema.fields.map((f) => f.name)).toEqual(['d', 'e', 'f']);
    // eslint-disable-next-line no-sparse-arrays
    validateTable({ ...f([, ,], [0, 1, 2]), table }).run();
  });
  */
});

// @ts-ignore
function assignGeneratedTables(lhs: generate.GeneratedTable, rhs: generate.GeneratedTable) {
  return function createAssignedTestData(lhsIndices: any[], rhsIndices: any[]) {
    const pluckLhs = (xs: any[], ys: any[] = []) =>
      lhsIndices.reduce((ys, i, j) => {
        if (i !== undefined) {
          ys[i] = xs ? xs[j] : null;
        }
        return ys;
      }, ys);
    const pluckRhs = (xs: any[], ys: any[] = []) =>
      rhsIndices.reduce((ys, i, j) => {
        if (i !== undefined) {
          ys[i] = xs ? xs[j] : null;
        }
        return ys;
      }, ys);
    const cols = () => [...pluckLhs(lhs.cols(), pluckRhs(rhs.cols()))];
    const keys = () => [...pluckLhs(lhs.keys(), pluckRhs(rhs.keys()))];
    const rows = () => [...zip(lhs.rows(), rhs.rows())].map(([x, y]) => [...pluckLhs(x, pluckRhs(y))]);
    const colBatches = [...zip(lhs.colBatches, rhs.colBatches)].map(([x, y]) => () => [...pluckLhs(x(), pluckRhs(y()))]);
    const keyBatches = [...zip(lhs.keyBatches, rhs.keyBatches)].map(([x, y]) => () => [...pluckLhs(x(), pluckRhs(y()))]);
    const rowBatches = [...zip(lhs.rowBatches, rhs.rowBatches)].map(
      ([x, y]) =>
        () =>
          [...zip(x(), y())].map(([x, y]) => [...pluckLhs(x, pluckRhs(y))])
    );
    return { cols, keys, rows, colBatches, keyBatches, rowBatches };
  };
}
