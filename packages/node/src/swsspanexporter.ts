import { SpanExporter, ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { ExportResult, ExportResultCode, hrTimeToMicroseconds } from '@opentelemetry/core';
import { SwsSpan } from '@swaggerstats/core';
import Debug from 'debug';
const debug = Debug('sws:spanexporter');

export class SwsSpanExporter implements SpanExporter {
  private _processor: any;
  protected _stopped = false;

  constructor(processor: any) {
    this._processor = processor;
  }

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    if (this._stopped)
      return resultCallback({
        code: ExportResultCode.FAILED,
        error: new Error('Exporter has been stopped'),
      });
    //this._finishedSpans.push(...spans);
    this._processSpans(spans);
    setTimeout(() => resultCallback({ code: ExportResultCode.SUCCESS }), 0);
  }

  shutdown(): Promise<void> {
    this._stopped = true;
    return Promise.resolve();
  }

  _exportInfo(span: ReadableSpan): any {
    return {
      traceId: span.spanContext().traceId,
      parentId: span.parentSpanId,
      name: span.name,
      id: span.spanContext().spanId,
      kind: span.kind,
      timestamp: hrTimeToMicroseconds(span.startTime),
      duration: hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
    };
  }

  _processSpans(spans: ReadableSpan[]) {
    for (const span of spans) {
      debug(this._exportInfo(span));
      // convert to span
      const swsSpan = new SwsSpan().fromReadableSpan(span);
      this._processor.processSpan(swsSpan);
    }
  }
}
