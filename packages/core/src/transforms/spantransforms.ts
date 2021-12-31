/*
 * Span Transforms
 */
import { pathOr } from 'ramda';

class SpanTransforms {
  constructor() {
    // TODO
  }

  flatten(span: any): any {
    const schema = [
      { name: 'spanId', path: 'spanId' },
      { name: 'name', path: 'name' },
      { name: 'http.url', path: 'attributes.http.uri' },
    ];

    const result: any = {};
    schema.map((x) => {
      const key = x.name;
      result[key] = pathOr(null, x.path.split('.'), this);
    });
    return result;
  }
}

const spanTransforms = new SpanTransforms();
export { spanTransforms };
