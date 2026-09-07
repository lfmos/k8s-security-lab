# Security Validation

This document records practical security validation performed against the
Kubernetes Security Lab using Minikube, Docker and Calico.

The goal is to verify that the controls implemented in the hardened scenario
produce observable security differences when compared with the intentionally
insecure scenario.

## Environment

- Kubernetes: Minikube
- Container runtime: Docker
- CNI: Calico
- Workload: Flask + Gunicorn
- Hardened workload user: UID/GID `10001`
- Security scanner: Checkov

---

## 1. Network Segmentation

The hardened namespace applies a default-deny NetworkPolicy and explicitly
allows inbound traffic only from Pods labeled as authorized clients.

### Authorized client

Command:

```bash
kubectl exec authorized-client \
  -n k8s-security-hardened \
  -- curl -sS --max-time 5 \
  http://k8s-security-lab-hardened:5000/health
```

Result:

```json
{
  "application": "k8s-security-lab",
  "status": "healthy"
}
```

Status: **PASS**

The authorized client successfully reached the protected workload.

### Unauthorized client

Command:

```bash
kubectl exec unauthorized-client \
  -n k8s-security-hardened \
  -- curl -sS --max-time 5 \
  http://k8s-security-lab-hardened:5000/health
```

Result:

```text
Connection timed out
curl exit code: 28
```

Status: **PASS**

The unauthorized client was blocked by the NetworkPolicy.

---

## 2. Service Account Least Privilege

The hardened workload uses a dedicated ServiceAccount without additional
Role or RoleBinding permissions.

The following authorization checks were executed against the ServiceAccount.

### Read Pods

```bash
kubectl auth can-i get pods \
  --as=system:serviceaccount:k8s-security-hardened:k8s-security-lab \
  -n k8s-security-hardened
```

Result:

```text
no
```

### Read Secrets

```bash
kubectl auth can-i get secrets \
  --as=system:serviceaccount:k8s-security-hardened:k8s-security-lab \
  -n k8s-security-hardened
```

Result:

```text
no
```

### Update Deployments

```bash
kubectl auth can-i update deployments.apps \
  --as=system:serviceaccount:k8s-security-hardened:k8s-security-lab \
  -n k8s-security-hardened
```

Result:

```text
no
```

Status: **PASS**

No permissions were granted for the tested Kubernetes API operations.

---

## 3. Service Account Token Exposure

The two scenarios were compared to verify ServiceAccount token exposure.

### Hardened scenario

The hardened workload uses:

```yaml
automountServiceAccountToken: false
```

Runtime validation confirmed that the default Kubernetes ServiceAccount token
file was not present.

Result:

```text
False
```

Status: **PASS**

### Insecure scenario

The intentionally insecure workload allows automatic token mounting.

Runtime validation confirmed that the ServiceAccount token file was present.

Result:

```text
True
```

This behavior is intentional and demonstrates the increased credential
exposure of the insecure configuration.

---

## 4. Container User

The insecure workload was inspected at runtime.

Command:

```bash
kubectl exec \
  -n k8s-security-insecure \
  deployment/k8s-security-lab-insecure \
  -- id -u
```

Result:

```text
0
```

The insecure container therefore runs as `root`.

The hardened workload is explicitly configured to run as UID/GID `10001`
with `runAsNonRoot: true`.

---

## 5. Hardened Security Controls

The hardened Deployment applies several container and Pod-level controls:

```yaml
runAsNonRoot: true
runAsUser: 10001
runAsGroup: 10001
allowPrivilegeEscalation: false
readOnlyRootFilesystem: true
```

All Linux capabilities are dropped:

```yaml
capabilities:
  drop:
    - ALL
```

The Pod also uses:

```yaml
seccompProfile:
  type: RuntimeDefault
```

CPU and memory requests and limits are defined, and the application provides
both readiness and liveness probes.

---

## 6. Pod Security

The hardened namespace uses Kubernetes Pod Security Admission with the
`restricted` profile.

```yaml
pod-security.kubernetes.io/enforce: restricted
pod-security.kubernetes.io/warn: restricted
pod-security.kubernetes.io/audit: restricted
```

The insecure namespace intentionally permits a less restrictive security
profile so vulnerable configurations can be demonstrated in a controlled lab.

---

## 7. Insecure vs Hardened Comparison

| Control | Insecure | Hardened |
|---|---|---|
| Container runs as root | Yes | No |
| Dedicated non-root UID/GID | No | `10001` |
| ServiceAccount token mounted | Yes | No |
| Privilege escalation | Allowed | Disabled |
| Root filesystem | Writable | Read-only |
| Linux capabilities | `NET_RAW` added | `drop: ALL` |
| Seccomp | Not explicitly configured | `RuntimeDefault` |
| Resource requests/limits | Not configured | Configured |
| Health probes | Not configured | Configured |
| Network isolation | None | Default deny + explicit allow |
| Pod Security profile | Privileged lab scenario | Restricted |

---

## 8. Static Security Analysis

The hardened Kubernetes manifests were analyzed with Checkov.

Final scan result:

```text
Passed checks: 264
Failed checks: 0
Skipped checks: 6
Parsing errors: 0
```

Status: **PASS**

The skipped checks are documented exceptions:

- readiness and liveness probes are not applicable to the two diagnostic
  client Pods whose only purpose is controlled connectivity testing;
- the application image is built locally and loaded directly into Minikube,
  which requires the local-image workflow used by this lab.

No unresolved Checkov failures remain in the hardened scenario.

---

## Conclusion

The validation demonstrates measurable differences between the intentionally
insecure and hardened Kubernetes configurations.

The hardened scenario combines multiple defensive layers, including non-root
execution, reduced privileges, ServiceAccount token protection, Pod Security,
seccomp, resource controls and NetworkPolicy-based segmentation.

The insecure scenario is intentionally vulnerable and exists only for
educational comparison inside a controlled local environment.