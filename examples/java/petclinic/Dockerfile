FROM maven:3.5.2-jdk-8-alpine

COPY spring-petclinic-2.6.0-SNAPSHOT.jar /
COPY opentelemetry-javaagent.jar /

ENV OTEL_SERVICE_NAME="petclinic"

ENV OTEL_TRACES_EXPORTER="otlp,logging"

# Send traces to OpenTelemetry collector
ENV OTEL_EXPORTER_OTLP_ENDPOINT="http://collector-opentelemetry-collector.observability.svc.cluster.local:4317"

ENTRYPOINT ["java","-Xmx4g","-javaagent:opentelemetry-javaagent.jar","-jar","spring-petclinic-2.6.0-SNAPSHOT.jar"]
