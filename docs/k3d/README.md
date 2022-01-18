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

### Misc commands

How to add port mapping to existing cluster

```shell
k3d cluster edit sws2 --port-add 443:443@loadbalancer
```


https://github.com/rancher/k3d/issues/292

## Install Grafana Stack in k3d

```shell
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### Install Grafana

```shell
helm install -f grafana.values.yaml --create-namespace -n grafana grafana grafana/grafana 
```

### Install Loki-Stack - loki, promtail, prometheus

```shell
helm install -f loki-stack.values.yaml -n grafana lokistack grafana/loki-stack 
```

### TODO Install Prometheus separately

### TODO Install Tempo

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

