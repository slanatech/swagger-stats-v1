# swagger-stats Docs

This summarizes some working assumptions and design for key elements of `swagger-stats` functionality

## Calculating metrics on Spans and Traces 

We're interested in tracking several key metrics of the communication between [micro]services in the deployment. 
These are at least Volume, Errors and Latency 

### Volume 

Number of calls one services made to another service. 

### Errors 

Number of errors observed on the calls from one service to another.

Track **depth** of the error. That is, how deep is error in the trace spans chain. 
On visualization, error spans with higher depth should have bolder color. 
This should show where is the origin of error originated - 
i.e. when chain of services calls each other, and error happens in the last one - such as db failure - error will be
propagated back up the call stack. But we are interested in the root cause, so we need to know that db failed, and all the rest is consequence. 

### Latency 

Latency of the calls from one service to another.