# Using k3d as test and CI/CD K8s environment

## Prerequisites

- kubectl 
- helm

## Create k3d Cluster with Nginx as ingress

```shell
k3d cluster create sws2 --k3s-arg "--no-deploy=traefik@server:*" --port 8082:80@loadbalancer --volume "$(pwd)/helm-ingress-nginx.yaml:/var/lib/rancher/k3s/server/manifests/helm-ingress-nginx.yaml"
```

https://github.com/rancher/k3d/issues/292

## References 

https://en.sokube.ch/post/k3s-k3d-k8s-a-new-perfect-match-for-dev-and-test-1

