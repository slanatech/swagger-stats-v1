# swagger-stats Docs

This summarizes some working assumptions and design for key elements of `swagger-stats` functionality

## Calculating metrics on Spans and Traces 

We're interested in tracking several key metrics of the communication between [micro]services in the deployment. 
These are at least Volume, Errors and Latency 

### Volume 

Number of requests one services sends to another service. 

### Errors 

Number of errors observed on the request from one service to another.

### Latency 

Latency of the request sent from one service to another.