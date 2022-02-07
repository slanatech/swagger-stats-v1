# Using k3d as test and CI/CD K8s environment

## Prerequisites

- kubectl 
- helm

## Create k3d Cluster with Nginx as ingress

```shell
k3d cluster create sws2 --k3s-arg "--no-deploy=traefik@server:*" --port 8082:80@loadbalancer --volume "$(pwd)/helm-ingress-nginx.yaml:/var/lib/rancher/k3s/server/manifests/helm-ingress-nginx.yaml"
```

This will install k3d with Nginx ingress (instead of traefik), and expose k3d ingress on localhost:8082

When deploying ingress for services, hostname could be specified as `<service>.localhost`, 
and then to access service: http://portainer.localhost:8082/ 

## TODO Configure registries access

https://k3d.io/v5.2.0/usage/registries/

Add gcr.io 


### Misc commands

How to add port mapping to existing cluster

```shell
k3d cluster edit sws2 --port-add 443:443@loadbalancer
k3d cluster edit sws2 --port-add 6379:6379@loadbalancer
```


https://github.com/rancher/k3d/issues/292

## Install Data Stack in k3d

```shell
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

### Postgres

This deploys Postgres with LoadBalancer service type

```shell
helm install -f postgres.values.yaml --create-namespace -n data postgres bitnami/postgresql 
helm uninstall -n data postgres 
```

To access from the outside of k3d cluster:

```shell
$ kubectl get services -n data
NAME                           TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
postgres-postgresql-headless   ClusterIP      None          <none>        5432/TCP         13m
postgres-postgresql            LoadBalancer   10.43.45.71   172.25.0.3    5432:31910/TCP   13m
```
Connect to EXTERNAL-IP:5432  

To access from the inside of k3d cluster - connect to `postgres-postgresql.data.svc.cluster.local:5432`


### Redis

Redis is deployed using manifest that creates a service with type: LoadBalancer, so it can be accessed externally.
redislabs/redismod docker image is used. It contains redis with all the modules that can be used in experiments. 

```shell
kubectl create -f redis.yaml
kubectl create -f redisinsight.yaml
```

## Install Observability Stack in k3d

```shell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### Install Grafana

```shell
helm install -f grafana.values.yaml --create-namespace -n observability grafana grafana/grafana 
helm uninstall -n observability grafana
```

### Install Loki-Stack - loki, promtail

```shell
helm install -f loki-stack.values.yaml --create-namespace -n observability loki grafana/loki-stack 
```

### Install Prometheus separately

```shell
helm install -f prometheus.values.yaml --create-namespace -n observability prometheus prometheus-community/prometheus 
```


### Install Tempo

```shell
helm install -f tempo.values.yaml --create-namespace -n observability tempo grafana/tempo 
```

### Install Open Telemetry Collector

OpenTelemetry Collector installed in standalone mode and configured to send traces to Tempo.
Logs and Metrics pipelines are disabled in OpenTelemetry Collector - they are covered by Prometheus and Loki in this deployment. 

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```


```shell
helm install -f otelcollector.values.yaml --create-namespace -n observability collector open-telemetry/opentelemetry-collector 
helm uninstall -n observability collector 
```


## Additional Examples 

### Install Portainer in k3d 

```shell
helm install --create-namespace -n portainer portainer portainer/portainer \
  --set service.type=ClusterIP \
  --set ingress.enabled=true \
  --set ingress.annotations.'kubernetes\.io/ingress\.class'=nginx \
  --set ingress.annotations."nginx\.ingress\.kubernetes\.io/backend-protocol"=HTTP \
  --set ingress.hosts[0].host=portainer.localhost \
  --set ingress.hosts[0].paths[0].path="/"
```

### Install Kubernetes Dashboard in k3d

```shell
helm repo add kubernetes-dashboard https://kubernetes.github.io/dashboard/
```

```shell
helm install kubernetes-dashboard kubernetes-dashboard/kubernetes-dashboard \
  --set ingress.enabled=true \
  --set ingress.annotations.'kubernetes\.io/ingress\.class'=nginx \
  --set ingress.annotations."nginx\.ingress\.kubernetes\.io/backend-protocol"=HTTPS \
  --set ingress.hosts[0]=dashboard.localhost
```


## References 

https://en.sokube.ch/post/k3s-k3d-k8s-a-new-perfect-match-for-dev-and-test-1

