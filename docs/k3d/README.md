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


https://github.com/rancher/k3d/issues/292

## Examples 

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

## References 

https://en.sokube.ch/post/k3s-k3d-k8s-a-new-perfect-match-for-dev-and-test-1

