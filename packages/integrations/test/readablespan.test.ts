import opentelemetry from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SimpleSpanProcessor, InMemorySpanExporter } from '@opentelemetry/sdk-trace-base';
import { fromReadableSpan } from '../src';

const TEST_NAME = 'readableSpan.conversion.test';

const tracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: TEST_NAME,
  }),
});
tracerProvider.register();
const exportedSpans = new InMemorySpanExporter();
const tracer = opentelemetry.trace.getTracer('basic-tracer-node');
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(exportedSpans));

describe('ReadableSpan Conversion Test', function () {
  beforeAll(() => {
    const testSpan = tracer.startSpan('main');
    // +++
    testSpan.end();
  });

  it('Should convert spans', async () => {
    const readableSpans = exportedSpans.getFinishedSpans();
    const span = fromReadableSpan(readableSpans[0]);
    expect(span.valid).toBeTruthy();
  });
});
