/** Swagger-Stats Node monitor.
 *  Initializes OpenTracing, enables auto-instrumentation for node app, and sets up embedded swagger-stats monitoring */

import { Span } from "@opentelemetry/api";
import { Resource } from '@opentelemetry/resources';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
//import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
//import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
//const { HapiInstrumentation } = require('@opentelemetry/instrumentation-hapi');
import { NodeTracerProvider } from '@opentelemetry/node';
//const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';

// Reconsider order of imports - Open Telemetry must be imported before everything else, i.e. before http imports

import { SwsOptions } from './swsoptions';
import { SwsSpanExporter } from './swsspanexporter';
import { SwsProcessor } from './swsprocessor';
import { SwsServer } from './swsserver';

import Debug from 'debug';
const debug = Debug('sws:node');

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
    // TODO Support option to pass already pre-created NodeTracerProvider
    this.tracerProvider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.options.name,
      }),
    });
    this.server = new SwsServer(this.options, this.processor);
  }

  start() {
    //
    this.server.start();
    // Consider using ignoreIncomingPaths option of http instrumentation to suppress tracing of swagger-stats API
    this.initializeOpenTracing();
  }

  initializeOpenTracing() {
    this.tracerProvider.register();

    registerInstrumentations({
      instrumentations: [
        getNodeAutoInstrumentations({
          /* example - load custom configuration for http instrumentation
          '@opentelemetry/instrumentation-http': {
            applyCustomAttributesOnSpan: (span) => {
              span.setAttribute('foo2', 'bar2');
            },
          }, */
        }),
      ],
    });

    // Add internal swagger-stats span processor
    this.tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new SwsSpanExporter(this.processor)));
    debug(`OpenTelemetry initialized`);

    // TODO Support exporters configuration

    // TODO Register additional instrumentations
    // TODO Consider: Support Instrumentations configurations
    // TODO Consider: Check supplied instrumentations, extend as needed, i.e. add HttpInstrumentation if not supplied
    /*
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
    */
  }

  // This is how to add custom attributes to span based on http request / response
  handleHttpCustomAttribute(span: Span, request: ClientRequest | IncomingMessage, response: IncomingMessage | ServerResponse) {
    debug(`Got something !`);
  }
}
