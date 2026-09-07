# Kubernetes Security Lab

Laboratório prático de segurança em Kubernetes criado para comparar, testar e validar diferentes configurações de segurança em workloads containerizados.

O projeto possui dois cenários principais:

- **Insecure:** ambiente propositalmente vulnerável, usado para demonstrar riscos de configurações inadequadas.
- **Hardened:** ambiente configurado com controles de segurança, princípio do menor privilégio e isolamento de rede.

O objetivo é demonstrar de forma prática como decisões de configuração afetam a segurança de aplicações executadas em Kubernetes.

## Objetivos do projeto

Este laboratório foi desenvolvido para praticar conceitos de:

- Kubernetes Security
- Container Hardening
- Pod Security Standards
- NetworkPolicy
- Least Privilege
- Service Accounts
- Security Contexts
- Segregação de rede
- Infrastructure as Code Security
- Validação automatizada com Checkov

## Arquitetura

```text
k8s-security-lab/
│
├── app/
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── docs/
│   └── VALIDATION.md
│
├── scenarios/
│   ├── insecure/
│   └── hardened/
│
├── .gitattributes
├── .gitignore
├── LICENSE
└── README.md
```

A aplicação utilizada como workload de teste é uma API simples desenvolvida em Python com Flask e executada com Gunicorn.

Ela serve como alvo controlado para os experimentos de segurança do laboratório.

## Cenário Insecure

O cenário `insecure` representa configurações que aumentam a superfície de ataque de um workload Kubernetes.

Entre os comportamentos propositalmente inseguros estão:

- execução do container como `root`;
- montagem automática do token da Service Account;
- possibilidade de privilege escalation;
- filesystem gravável;
- capability adicional `NET_RAW`;
- ausência de políticas de isolamento de rede;
- ausência de controles adicionais de hardening.

Essas configurações existem exclusivamente para fins educacionais e de comparação com o ambiente endurecido.

## Cenário Hardened

O cenário `hardened` aplica diferentes controles de segurança.

Entre eles:

- execução como usuário não-root;
- UID e GID dedicados;
- `allowPrivilegeEscalation: false`;
- `readOnlyRootFilesystem: true`;
- remoção de Linux capabilities com `drop: ALL`;
- perfil `seccomp` com `RuntimeDefault`;
- desativação do mount automático do Service Account Token;
- limites e requests de CPU e memória;
- readiness e liveness probes;
- Service do tipo `ClusterIP`;
- Pod Security no nível `restricted`;
- políticas de rede com estratégia `default deny`;
- comunicação permitida somente para clientes autorizados.

## NetworkPolicy

O laboratório utiliza NetworkPolicies para demonstrar isolamento de tráfego entre Pods.

O comportamento esperado é:

```text
authorized-client
        │
        │ permitido
        ▼
k8s-security-lab-hardened


unauthorized-client
        │
        │ bloqueado
        X
k8s-security-lab-hardened
```

O ambiente local utiliza o Calico como CNI para permitir a aplicação efetiva das NetworkPolicies.

## Validação prática

Os controles implementados foram testados em um cluster Kubernetes local com Minikube.

Entre as validações realizadas:

| Controle | Insecure | Hardened |
|---|---|---|
| Execução como root | Sim | Não |
| Service Account Token montado | Sim | Não |
| Privilege escalation | Permitido | Bloqueado |
| Root filesystem | Gravável | Read-only |
| Linux capabilities | `NET_RAW` | `drop: ALL` |
| Seccomp | Não definido | `RuntimeDefault` |
| NetworkPolicy | Não | Sim |
| Pod Security | Privileged | Restricted |
| Resource limits | Não | Sim |
| Health probes | Não | Sim |

Também foram realizados testes de conectividade para confirmar que apenas o cliente autorizado consegue alcançar o workload protegido.

Os resultados detalhados estão disponíveis em:

```text
docs/VALIDATION.md
```

## Security Scanning

Os manifestos do cenário hardened foram analisados com o Checkov.

Resultado final da validação:

```text
Passed checks: 264
Failed checks: 0
Skipped checks: 6
Parsing errors: 0
```

Os checks ignorados possuem justificativas explícitas relacionadas a componentes utilizados exclusivamente para diagnóstico e à imagem da aplicação carregada localmente no Minikube.

O objetivo das exceções não é ocultar vulnerabilidades, mas documentar decisões técnicas específicas do ambiente de laboratório.

## Ambiente utilizado

O laboratório foi validado utilizando:

- Docker
- Kubernetes
- Minikube
- Calico
- Python
- Flask
- Gunicorn
- Checkov

## Aplicação de teste

A API possui endpoints simples para permitir testes de disponibilidade e conectividade:

```text
GET /
GET /health
GET /ready
GET /api/status
```

Exemplo de resposta:

```json
{
  "application": "k8s-security-lab",
  "status": "healthy"
}
```

## Executando localmente

Construa a imagem:

```bash
docker build -t k8s-security-lab:v2 ./app
```

Inicie o Minikube com suporte a NetworkPolicy:

```bash
minikube start --driver=docker --cni=calico
```

Carregue a imagem local no cluster:

```bash
minikube image load k8s-security-lab:v2
```

Os manifestos de cada ambiente estão disponíveis em:

```text
scenarios/insecure/
scenarios/hardened/
```

> O cenário `insecure` contém configurações deliberadamente vulneráveis e deve ser utilizado somente em ambientes controlados de laboratório.

## Principais aprendizados

Este projeto demonstra na prática que a segurança de workloads Kubernetes depende de diferentes camadas trabalhando em conjunto.

Um container não-root, por exemplo, não é suficiente isoladamente. O cenário hardened combina controles de identidade, runtime, filesystem, capabilities, recursos, rede e políticas do cluster para reduzir a superfície de ataque.

A comparação direta entre os dois cenários permite observar não apenas quais configurações são recomendadas, mas também o risco associado à ausência delas.

## Autor

**Luís Filipe Medeiros**

- GitHub: https://github.com/lfmos
- Portfólio: https://lfmos.github.io/