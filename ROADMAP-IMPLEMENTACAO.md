# Roadmap restante — Link Engine

> Atualizado em 06/10/2026. A implementação do cache de analytics e o Passo 4 foram concluídos. Os testes operacionais do cache serão escritos manualmente seguindo `apps/api/GUIA-DE-TESTES.md`.

## Validação operacional — Cache de analytics

- [ ] Recriar manualmente os testes de HIT, MISS, isolamento e invalidação descritos em `apps/api/GUIA-DE-TESTES.md`.
- [ ] Repetir o smoke test com um `REDIS_URL` acessível e registrar `MISS` → `HIT` com uma única query analítica. A tentativa de 18/09/2026 expirou sem resposta do Redis configurado.

## Passo 4 — Completar Swagger e OpenAPI

- [x] Mover `@nestjs/swagger` para `apps/api`, alinhando sua versão ao Nest 10, e documentar grupos, DTOs, respostas e erros (`400`, `401`, `403`, `404` e `429`).
- [x] Documentar Bearer nas rotas privadas. A documentação de API Key permanece vinculada à criação da API pública no Passo 6.
- [x] Gerar `openapi.json` no build, validá-lo por lint e confirmar que ele gera um cliente TypeScript utilizável.

## Passo 5 — Rate limiting distribuído

- [ ] Configurar `@nestjs/throttler` com Redis: 100 req/min nas rotas autenticadas e 20 req/min em login, cadastro e redirect.
- [ ] Tratar corretamente o IP atrás do proxy do Render e responder `429` com `Retry-After` e headers de limite.
- [ ] Definir fallback para que indisponibilidade do Redis não derrube o redirect público.

## Passo 6 — API Keys e API pública

- [ ] Criar `ApiKey` e migration com nome, hash, prefixo, scopes, uso, criação, revogação e proprietário.
- [ ] Gerar chaves `lk_live_` com `crypto.randomBytes`, armazenar somente o hash e revelar o valor completo apenas na criação.
- [ ] Implementar autenticação por `X-API-Key`, validação de revogação/scopes e atualização eficiente de `lastUsedAt`.
- [ ] Criar gestão autenticada de chaves e contratos versionados para `/v1/links` e `/v1/analytics`, com rate limit próprio.

## Passo 7 — Webhooks

- [ ] Criar `Webhook` e `WebhookDelivery` com migration e isolamento por usuário.
- [ ] Enfileirar eventos de clique versionados e únicos, assinados com HMAC-SHA256 em `X-Webhook-Signature`.
- [ ] Registrar tentativas, aplicar três retries com backoff e oferecer reenvio autenticado.
- [ ] Proteger a entrega contra SSRF, redirects/DNS maliciosos, destinos não HTTPS, timeout e respostas excessivas.

## Passo 8 — Painel de configurações

- [ ] Criar `/settings/api-keys` para listar, criar com revelação única, copiar e revogar chaves.
- [ ] Criar `/settings/webhooks` para CRUD, seleção de eventos, histórico de entregas, erro seguro e reenvio.
- [ ] Garantir que secrets nunca reapareçam e que cada usuário veja somente os próprios recursos.

## Passo 9 — Qualidade e produção

- [ ] Tornar o ESLint da API funcional e zerar erros relevantes do frontend.
- [ ] Criar CI com `prisma generate`, typecheck, lint, testes e build; bloquear merge em falhas.
- [ ] Automatizar `prisma migrate deploy` e restringir CORS a produção, previews autorizados e ambiente local.
- [ ] Completar `.env.example` e README com setup, arquitetura, deploy, URLs e decisões técnicas.
- [ ] Adicionar logs estruturados, monitoramento de erros e health checks de PostgreSQL/Redis.
- [ ] Definir retenção/anonimização de IPs e revisar pooling/cold start do PostgreSQL/Neon.

## Passo 10 — Testes automatizados

- [ ] Criar factories/fixtures e ambientes exclusivos de PostgreSQL e Redis, com limpeza entre testes.
- [ ] Cobrir regras críticas de Auth, Links, Analytics, BullMQ, API Keys, Webhooks e rate limiting com casos positivos, negativos e de isolamento.
- [ ] Cobrir em integração/e2e o fluxo cadastro → login → link → redirect → fila → analytics → webhook, incluindo dois usuários e respostas `401`, `403`, `404` e `429`.
- [ ] Cobrir os fluxos críticos do frontend e documentar como executar cada suíte.
- [ ] Publicar cobertura no CI como indicador auxiliar, sem substituir testes de comportamento.

## Sequência sugerida de commits

1. `docs(api): complete Swagger documentation and OpenAPI export`
2. `feat(api): add distributed rate limiting`
3. `feat(api-keys): add scoped public API authentication`
4. `feat(webhooks): deliver signed click events with retries`
5. `feat(settings): add API key and webhook management pages`
6. `chore(quality): add CI and production hardening`
7. `test: cover critical authentication, analytics and delivery flows`
