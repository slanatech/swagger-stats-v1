FROM maven:3.5.2-jdk-8-alpine

#COPY spring-petclinic-2.6.0-SNAPSHOT.jar /

COPY spring-petclinic-rest-2.6.2.jar /
COPY opentelemetry-javaagent.jar /

ENV OTEL_SERVICE_NAME="petclinic"

ENV OTEL_TRACES_EXPORTER="otlp,logging"

# Send traces to OpenTelemetry collector
ENV OTEL_EXPORTER_OTLP_ENDPOINT="http://collector-opentelemetry-collector.observability.svc.cluster.local:4317"

# Connect to Postgres
ENV POSTGRES_URL="jdbc:postgresql://postgres-postgresql.data.svc.cluster.local:5432/postgres"
ENV POSTGRES_USER="postgres"
ENV POSTGRES_PASS="postgres"

ENTRYPOINT ["java","-Xmx4g","-javaagent:opentelemetry-javaagent.jar","-Dspring.profiles.active=postgresql,spring-data-jpa","-jar","spring-petclinic-rest-2.6.2.jar"]
