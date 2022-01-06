import { pathOr } from 'ramda';
import { SwsSpan } from '../entity/swsspan';

// TODO Add here mapping of known instrumentation libraries to categories
const categoriesByInstrumentation = {
  '@opentelemetry/instrumentation-http': 'http',
  '@opentelemetry/instrumentation-express': 'express',
};

/* resolve category based on instrumentation library */
export function resolveCategory(span: SwsSpan): void {
  if (!span.instrumentationLibrary) {
    return;
  }

  // Handle some well-known patterns first
  if (span.instrumentationLibrary.startsWith('@opentelemetry/instrumentation-')) {
    // I.e. "@opentelemetry/instrumentation-http"
    span.category = span.instrumentationLibrary.slice(31);
    return;
  }

  span.category = pathOr(null, [span.instrumentationLibrary], categoriesByInstrumentation);
}
