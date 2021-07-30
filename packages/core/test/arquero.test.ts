//const path = require('path');
//const { pathOr } = require('ramda');
import * as aq from 'arquero';

describe.skip('Arquero Test', function () {
  it('Should create simple tables to and from arrow', async () => {
    const dt = aq.table({
      Seattle: [69, 108, 178, 207, 253, 268, 312, 281, 221, 142, 72, 52],
      Chicago: [135, 136, 187, 215, 281, 311, 318, 283, 226, 193, 113, 106],
      'San Francisco': [165, 182, 251, 281, 314, 330, 300, 272, 267, 243, 189, 156],
    });
    //dt.print();
    const adt = dt.toArrow();
    const aadt = aq.fromArrow(adt);

    console.log(`opa: ${adt.count()} - ${aadt.count()}`);
  });

  it('Should create large arrow table', async () => {
    //dt.print();
    let tableData: any = {};
    for (let i = 0; i < 10; i++) {
      const columnData = [];
      for (let j = 0; j < 1; j++) {
        columnData.push(j);
      }
      tableData[`series${i}`] = columnData;
    }
    const dt = aq.table(tableData);
    const adt = dt.toArrow();
    const aadt = aq.fromArrow(adt);

    const rowData: any = {};
    for (let i = 0; i < 10; i++) {
      const seriesKey = `series${i}`;
      rowData[seriesKey] = [0];
    }
    const rdt = aq.table(rowData);
    const dt2 = dt.concat(rdt);
    dt2.print();
    // This converts from Arrow data format back to arquero arrays ...
    const aadt2 = rdt.concat(aadt);
    aadt2.print();
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    console.log(`opa: ${adt.count()} - ${aadt.count()}`);
  });

  it.skip('Should create large table', async () => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
    let tableData: any = {};
    for (let i = 0; i < 1000; i++) {
      const columnData = [];
      for (let j = 0; j < 1000; j++) {
        columnData.push(j);
      }
      tableData[`series${i}`] = columnData;
    }
    const used2 = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used2 * 100) / 100} MB`);
    let dt = aq.table(tableData);
    const used3 = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used3 * 100) / 100} MB`);
    //dt.print();
    const adt = dt.toArrow();
    const used4 = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used4 * 100) / 100} MB`);
    const aadt = aq.fromArrow(adt);
    const used5 = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`The script uses approximately ${Math.round(used5 * 100) / 100} MB`);
    console.log(`opa: ${dt.count()} ${adt.count()} ${aadt.count()}`);
  });
});
