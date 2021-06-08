# Installs loki-stack 

values.yaml provides specific var overrides

Install as:

```
helm repo add grafana https://grafana.github.io/helm-charts

helm upgrade --install loki grafana/loki-stack -f values.yaml
```

Make sure to deploy ingress (for docker deskop k8s )

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.41.2/deploy/static/provider/cloud/deploy.yaml
```
https://stackoverflow.com/questions/65193758/enable-ingress-controller-on-docker-desktop-with-wls2


