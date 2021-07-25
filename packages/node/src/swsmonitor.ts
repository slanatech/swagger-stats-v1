import { Span } from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
//const { HapiInstrumentation } = require('@opentelemetry/instrumentation-hapi');
import { NodeTracerProvider } from '@opentelemetry/node';
//const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { SwsSpanExporter } from './swsspanexporter';
//const swsSettings = require('./swssettings');
//const swsProcessor = require('./swsProcessor');
import Debug from 'debug';
const debug = Debug('sws:monitor');

// TODO Tracer
//  const opentelemetry = require('@opentelemetry/api');
//  const tracer = opentelemetry.trace.getTracer('spectest');

export class SwsMonitor {
  public tracerProvider: NodeTracerProvider;

  constructor() {
    this.tracerProvider = new NodeTracerProvider();
  }

  start(options: any) {
    this.initializeOpenTracing(options);
  }

  // This is how to add custom attributes to span based on request / response
  handleHttpCustomAttribute(span: Span, request: ClientRequest | IncomingMessage, response: IncomingMessage | ServerResponse) {
    debug(`Got something !`);
  }

  initializeOpenTracing(options: any) {
    this.tracerProvider.register();
    // TODO Support Instrumentations configurations
    // TODO Check supplied instrumentations, extend as needed, i.e. add HttpInstrumentation if not supplied
    registerInstrumentations({
      // This enables all available Instrumentations
      tracerProvider: this.tracerProvider,
      instrumentations: [
        new HttpInstrumentation({
          applyCustomAttributesOnSpan: this.handleHttpCustomAttribute,
        }),
        new ExpressInstrumentation(),
      ],
      // Skip express for now
      //instrumentations: [new HttpInstrumentation({})],
    });

    // TODO Support exporters configuration
    //provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    //this.provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

    // TODO Supply processor
    this.tracerProvider.addSpanProcessor(
      new SimpleSpanProcessor(
        new SwsSpanExporter({
          processSpan: () => {
            debug('TEMP');
          },
        })
      )
    );
    debug(`OpenTelemetry initialized`);
  }
}
