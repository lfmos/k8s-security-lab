# Security Validation

This document records practical security validation performed against the
K8s Security Lab using Minikube and Calico.

## Environment

- Kubernetes: Minikube
- Container runtime: Docker
- CNI: Calico
- Workload: Flask + Gunicorn
- Hardened workload UID/GID: `10001`

---

## 1. Network Segmentation

The hardened namespace uses a default-deny NetworkPolicy and explicitly
allows traffic only from Pods labeled as authorized clients.

### Authorized client

```bash
kubectl exec authorized-client \
  -n k8s-security-hardened \
  -- curl -sS --max-time 5 \
  http://k8s-security-lab-hardened:5000/health