const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HapiInstrumentation } = require('@opentelemetry/instrumentation-hapi');
const { NodeTracerProvider } = require('@opentelemetry/node');
//const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { SwsSpanExporter } = require('./swsSpanExporter');
const swsSettings = require('./swssettings');
const swsProcessor = require('./swsProcessor');
const debug = require('debug')('sws:monitor');

// TODO Tracer
//  const opentelemetry = require('@opentelemetry/api');
//  const tracer = opentelemetry.trace.getTracer('spectest');

class SwsMonitor {
  constructor() {
    this.tracerProvider = null;
  }

  start(options) {
    this.initializeOpenTracing(options);
  }

  initializeOpenTracing(options) {
    this.tracerProvider = new NodeTracerProvider();
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
    this.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new SwsSpanExporter(swsProcessor)));
    debug(`OpenTelemetry initialized`);
  }
}

let swsMonitor = new SwsMonitor();
module.exports = {
  swsMonitor,
};
