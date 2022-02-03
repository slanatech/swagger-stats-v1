import { fromOtlp } from '../src';
//import { readFileSync } from 'fs';
// load samples from data
import { Buffer } from 'buffer';
import * as otlpGrpcData from './data/otlp_grpc_resourceSpans.json';

function fixBuffers(obj: any, props: string[]) {
  Object.keys(obj).map((x) => {
    if (Array.isArray(obj[x])) {
      obj[x].map((o: any) => {
        fixBuffers(o, props);
      });
    } else if (typeof obj[x] === 'object') {
      if (props.includes(x)) {
        obj[x] = Buffer.from(obj[x]);
      } else {
        fixBuffers(obj[x], props);
      }
    }
  });
}

describe('OTLP Convertor Test', function () {
  beforeAll(() => {
    fixBuffers(otlpGrpcData, ['trace_id', 'span_id', 'parent_span_id']);
  });

  it('Should check input data', async () => {
    expect(Array.isArray(otlpGrpcData.resourceSpans)).toBeTruthy();
    // Convert buffers from json obj back to buffers
  });

  it('Should convert spans', async () => {
    const resourceSpans = otlpGrpcData.resourceSpans;
    const spans = fromOtlp(resourceSpans);
    expect(spans.length === 2).toBeTruthy();
    expect(spans[0]).toMatchObject({
      valid: true,
      traceId: '0a7c34d5de2774a63de4aab2cbe87736',
      spanId: 'f338212242c18b2c',
      parentSpanId: null,
      hasChild: false,
      depth: null,
      name: 'HTTP GET',
      kind: 'server',
      category: null,
      service: 'petclinic',
      status: {
        message: '',
        code: 'STATUS_CODE_UNSET',
      },
      success: true,
      startTime: 1643834883158,
      endTime: 1643834883236,
      duration: 78,
      attributes: {
        'net.transport': 'ip_tcp',
        'http.target': '/',
        'http.flavor': '1.1',
        'net.peer.port': 47492,
        'net.peer.ip': '127.0.0.1',
        'thread.name': 'http-nio-9966-exec-5',
        'http.host': '127.0.0.1:9966',
        'net.peer.name': 'localhost',
        'http.server_name': '127.0.0.1',
        'thread.id': 39,
        'http.user_agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
        'http.response_content_length': 431,
        'http.method': 'GET',
        'http.status_code': 404,
        'http.scheme': 'http',
      },
      resourceAttributes: {
        'container.id': 'e4afefe4cf564fcf509e71d5cab25f6f80ab2cc0cf5cdf9f0475ec0669675faa',
        'host.arch': 'amd64',
        'host.name': 'sws-example-java-petclinic-79db65d8bb-895cf',
        'os.description': 'Linux 5.4.0-96-generic',
        'os.type': 'linux',
        'process.command_line': '/usr/lib/jvm/java-1.8-openjdk/jre:bin:java -Xmx4g -javaagent:opentelemetry-javaagent.jar -Dspring.profiles.active=postgresql,spring-data-jpa',
        'process.executable.path': '/usr/lib/jvm/java-1.8-openjdk/jre:bin:java',
        'process.pid': 1,
        'process.runtime.description': 'Oracle Corporation OpenJDK 64-Bit Server VM 25.121-b13',
        'process.runtime.name': 'OpenJDK Runtime Environment',
        'process.runtime.version': '1.8.0_121-b13',
        'service.name': 'petclinic',
        'telemetry.auto.version': '1.10.0',
        'telemetry.sdk.language': 'java',
        'telemetry.sdk.name': 'opentelemetry',
        'telemetry.sdk.version': '1.10.0',
      },
      instrumentationLibrary: 'io.opentelemetry.tomcat-7.0',
    });
    expect(spans[1]).toMatchObject({
      valid: true,
      traceId: '0a7c34d5de2774a63de4aab2cbe87736',
      spanId: 'ca3adc2889e21f99',
      parentSpanId: 'f338212242c18b2c',
      hasChild: false,
      depth: null,
      name: 'Response.sendError',
      kind: 'internal',
      category: null,
      service: 'petclinic',
      status: {
        message: '',
        code: 'STATUS_CODE_UNSET',
      },
      success: true,
      startTime: 1643834883225,
      endTime: 1643834883225,
      duration: 0,
      attributes: {
        'thread.id': 39,
        'thread.name': 'http-nio-9966-exec-5',
      },
      resourceAttributes: {
        'container.id': 'e4afefe4cf564fcf509e71d5cab25f6f80ab2cc0cf5cdf9f0475ec0669675faa',
        'host.arch': 'amd64',
        'host.name': 'sws-example-java-petclinic-79db65d8bb-895cf',
        'os.description': 'Linux 5.4.0-96-generic',
        'os.type': 'linux',
        'process.command_line': '/usr/lib/jvm/java-1.8-openjdk/jre:bin:java -Xmx4g -javaagent:opentelemetry-javaagent.jar -Dspring.profiles.active=postgresql,spring-data-jpa',
        'process.executable.path': '/usr/lib/jvm/java-1.8-openjdk/jre:bin:java',
        'process.pid': 1,
        'process.runtime.description': 'Oracle Corporation OpenJDK 64-Bit Server VM 25.121-b13',
        'process.runtime.name': 'OpenJDK Runtime Environment',
        'process.runtime.version': '1.8.0_121-b13',
        'service.name': 'petclinic',
        'telemetry.auto.version': '1.10.0',
        'telemetry.sdk.language': 'java',
        'telemetry.sdk.name': 'opentelemetry',
        'telemetry.sdk.version': '1.10.0',
      },
      instrumentationLibrary: 'io.opentelemetry.servlet-javax-common',
    });
  });
});
