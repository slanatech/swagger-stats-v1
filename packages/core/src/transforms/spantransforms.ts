/*
 * Span Transforms
 */
import { pathOr } from 'ramda';

class SpanTransforms {
  constructor() {
    // TODO
  }

  flatten(span: any): any {
    // TODO Move schema to dedicated class
    const schema = [
      { name: 'spanId', path: ['spanId'] },
      { name: 'name', path: ['name'] },
      { name: 'category', path: ['category'] },
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
