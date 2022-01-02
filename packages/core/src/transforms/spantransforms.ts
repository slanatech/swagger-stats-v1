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
      { name: 'spanId', path: ['spanId'] },
      { name: 'name', path: ['name'] },
      { name: 'http.url', path: ['attributes', 'http.url'] },
    ];

    const result: any = {};
    schema.map((x) => {
      const key = x.name;
      const path = x.path;
      result[key] = pathOr(null, path, span);
    });
    return result;
  }
}

const spanTransforms = new SpanTransforms();
export { spanTransforms };
