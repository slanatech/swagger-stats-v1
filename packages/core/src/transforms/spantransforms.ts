/*
 * Span Transforms
 */
import { pathOr } from 'ramda';
import { spanSchema } from '../schema/spanschema';

class SpanTransforms {
  constructor() {
    // TODO
  }

  flatten(span: any): any {
    const result: any = {};
    spanSchema.schemaData.map((x: any) => {
      const key = x.name;
      const path = x.path;
      result[key] = pathOr(null, path, span);
    });
    return result;
  }
}

const spanTransforms = new SpanTransforms();
export { spanTransforms };
