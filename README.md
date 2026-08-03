# Cluster Sentinel

Aplicação web criada para praticar Docker, Docker Compose e Kubernetes.

O projeto possui dois serviços:

- **Frontend:** interface em HTML, CSS e JavaScript servida pelo Nginx.
- **Backend:** API em Python com Flask.

O frontend consulta o backend pelo endpoint `/api/status` e exibe o estado da aplicação.

## Tecnologias

- HTML, CSS e JavaScript
- Nginx
- Python e Flask
- Docker e Docker Compose
- Kubernetes

## Estrutura

```text
secure-kubernetes-web-app/
├── backend/
├── frontend/
├── kubernetes/
├── docker-compose.yml
├── LICENSE
└── README.md
```

## Executar

Na raiz do projeto:

```bash
docker compose up --build -d
```

Acesse:

```text
http://localhost:8080
```

Para verificar os contêineres:

```bash
docker compose ps
```

Para encerrar:

```bash
docker compose down
```

## API

Endpoint principal:

```text
GET /api/status
```

Teste:

```bash
curl http://localhost:8080/api/status
```

## Kubernetes

A pasta `kubernetes` contém os manifestos de Namespace, Deployments, Services, ConfigMap, Secret, Ingress e HPA.

## Autor

Luís Filipe Medeiros

- GitHub: https://github.com/lfmos
- Portfólio: https://lfmos.github.io/
