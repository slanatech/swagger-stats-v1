import { pathOr } from 'ramda';
import { SwsSpan } from '../entity/swsspan';

const categoriesByInstrumentation = {
  '@opentelemetry/instrumentation-http': 'http',
  '@opentelemetry/instrumentation-express': 'express',
};

/* resolve category based on instrumentation library */
export function resolveCategory(span: SwsSpan): void {
  if (!span.instrumentationLibrary) {
    return;
  }
  span.category = pathOr(null, [span.instrumentationLibrary], categoriesByInstrumentation);
}
