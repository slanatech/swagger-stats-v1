//const path = require('path');
//const { pathOr } = require('ramda');
import * as aq from 'arquero';

describe('Arquero Test', function () {
  it('Should create simple tables to and from arrow', async () => {
    const dt = aq.table({
      Seattle: [69, 108, 178, 207, 253, 268, 312, 281, 221, 142, 72, 52],
      Chicago: [135, 136, 187, 215, 281, 311, 318, 283, 226, 193, 113, 106],
      'San Francisco': [165, 182, 251, 281, 314, 330, 300, 272, 267, 243, 189, 156],
    });
    dt.print();
    const adt = dt.toArrow();
    const aadt = aq.fromArrow(adt);
    console.log(`opa: ${adt.count()} - ${aadt.count()}`);
  });
});
