import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
//const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
//const { HapiInstrumentation } = require('@opentelemetry/instrumentation-hapi');
import { NodeTracerProvider } from '@opentelemetry/node';
//const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
//import { SimpleSpanProcessor } from '@opentelemetry/tracing';
//const { SwsSpanExporter } = require('./swsSpanExporter');
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

  initializeOpenTracing(options: any) {
    this.tracerProvider.register();
    // TODO Support Instrumentations configurations
    // TODO Check supplied instrumentations, extend as needed, i.e. add HttpInstrumentation if not supplied
    registerInstrumentations({
      // This enables all available Instrumentations
      tracerProvider: this.tracerProvider,
      //instrumentations: [new HttpInstrumentation({}), new ExpressInstrumentation()],
      // Skip express for now
      instrumentations: [new HttpInstrumentation({})],
    });
    // TODO Support exporters configuration
    //provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    //this.provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

    // TODO Enable !!!!
    //this.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new SwsSpanExporter(swsProcessor)));
    debug(`OpenTelemetry initialized`);
  }
}
