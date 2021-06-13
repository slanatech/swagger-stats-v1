# swagger-stats | Microservices Observability

> ## This repository contains swagger-stats 1.X code stream. This is work in progress at alpha stage and will be changed frequently   


> ## For stable 0.99.X swagger-state releases please refer to  https://github.com/slanatech/swagger-stats

Following are the guiding principles for swagger-stats 1.X.

As always, really looking forward for your feedback, suggestions and proposals !

Please comment in the [swagger-stats 1.X discussion](https://github.com/slanatech/swagger-stats/discussions/135) or open issues / PRs.

Expand the depth and scope of monitoring swagger-stats provides. Why limit to API monitoring only ? Swagger-stats will provide insights on ingress and egress API, Databases, GRPC, and much more. The target is to cover end-to-end processing of requests in microservices and across microservices.

Embrace OpenTelemetry - https://opentelemetry.io/. Swagger-stats will leverage OpenTelemetry under the hood with all the instrumentations available. We will use OpenTelemetry Tracing to get insights into requests processing in microservices and provide meaningful and actionable metrics and dashboards.

Support collecting and processing observability data in the deployments with multiple nodes of microservice deployed (i.e. N+1 ) as well as across multiple microservices

Support microservices developed in many different languages, not only node.js. Thanks to OpenTracing, swagger-stats will be able to collect and process data from any microservice instrumented with OpenTracing. Processing Traces will enable operational insights across entire deployment.

Support Kubernetes. Swagger-stats will provide Helm Chart and will allow easy deployment to K8s.

And of course, swagger-stats will keep enabling instant observability for Node.js microservices. Capability of requiring single package and getting metrics and dashboards instantly in your microservice is the key feature of swagger-stats, which, we believe, is essential, especially during early development stages.

Please share your thoughts, feedback and considerations !

## License

MIT
