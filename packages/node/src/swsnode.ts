/** Swagger-Stats Node monitor.
 *  Initializes OpenTracing, enables auto-instrumentation for node app, and sets up embedded swagger-stats monitoring */

// TODO Refactor using latest packages names and auto-instrumentations-node
//  https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/metapackages/auto-instrumentations-node

import { Span } from '@opentelemetry/api';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
//const { HapiInstrumentation } = require('@opentelemetry/instrumentation-hapi');
import { NodeTracerProvider } from '@opentelemetry/node';
//const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

// Reconsider order of imports - Open Telemetry must be imported before everything else, i.e. before http imports

import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { SwsOptions } from './swsoptions';
import { SwsSpanExporter } from './swsspanexporter';
import { SwsProcessor } from './swsprocessor';
import { SwsServer } from './swsserver';

import Debug from 'debug';
const debug = Debug('sws:node');

// TODO Tracer
//  const opentelemetry = require('@opentelemetry/api');
//  const tracer = opentelemetry.trace.getTracer('spectest');

/** Swagger-Stats Node monitor.
 *  Initializes OpenTracing, enables auto-instrumentation for node app, and sets up embedded swagger-stats monitoring */
export class SwsNode {
  public options: SwsOptions;
  public processor: SwsProcessor;
  public tracerProvider: NodeTracerProvider;
  public server: SwsServer;

  constructor(options: any = {}) {
    this.options = new SwsOptions(options);
    this.processor = new SwsProcessor(this.options);
    this.tracerProvider = new NodeTracerProvider();
    this.server = new SwsServer(this.options, this.processor);
  }

  start() {
    //
    this.server.start();
    // Consider using ignoreIncomingPaths option of http instrumentation to suppress tracing of swagger-stats API
    this.initializeOpenTracing(this.options);
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
    this.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new SwsSpanExporter(this.processor)));
    debug(`OpenTelemetry initialized`);
  }
}
