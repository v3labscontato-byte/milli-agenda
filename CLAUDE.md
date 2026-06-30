# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## REGRAS OBRIGATÓRIAS
1. SEMPRE ler DEVLOG.md antes de qualquer tarefa
2. SEMPRE atualizar DEVLOG.md após concluir qualquer tarefa (append `>>`, nunca sobrescrever)
3. SEMPRE rodar `npx tsc --noEmit` antes de commitar
4. NUNCA fazer push direto para `main` sem aprovação explícita do usuário
5. NUNCA adicionar `Co-Authored-By` em commits

## AMBIENTES — NÃO CONFUNDIR

### HOMOLOG (usar para todo desenvolvimento/teste/investigação)
- Frontend: https://frontend-nextjs-milli-homolog.up.railway.app
- Backend: https://backend-nestjs-milli-homolog.up.railway.app
- Tenant de teste: `studio-homolog` (`ddpobre@gmail.com` / `123456789`)

### PRODUÇÃO (NUNCA testar aqui — só leitura emergencial com aprovação explícita)
- Frontend: https://milli-agenda-production.up.railway.app
- Backend: https://victorious-sparkle-production-adbc.up.railway.app

**REGRA:** toda investigação, todo Playwright, todo curl de teste usa HOMOLOG por padrão.
Produção só é tocada com autorização explícita e específica do usuário para aquela ação.

## DESIGN SYSTEM DE TABELAS — OBRIGATÓRIO

Toda tabela nova deve seguir este padrão desde o início. Tabela que não seguir está incompleta.

### Colunas obrigatórias
- Tabelas financeiras: Data, Descrição, Valor (alinhado direita, BRL), Categoria, Status (badge), Ações
- Tabelas operacionais: Nome, Identificador secundário, Status (badge), Info de negócio, Ações
- Descrição NUNCA pode ser omitida em tabelas financeiras

### Coluna de Ações — sempre visível
- NUNCA esconder em hover, NUNCA transparente
- 1 ação: botão de texto direto
- 2+ ações: dropdown ⋮ sempre visível
- Ações de status (Dar baixa, Marcar pago): botão destacado FORA do dropdown
- Sempre incluir: Editar + Excluir/Desativar
- Excluir sempre pede confirmação antes de executar

### Status — sempre badge colorido (nunca texto solto)
- Pago/Ativo/Concluído: fundo #DCFCE7, texto #16A34A
- Pendente/Em aberto: fundo #FEF9C3, texto #CA8A04
- Atrasado/Vencido: fundo #FEE2E2, texto #DC2626
- Cancelado/Inativo: fundo #F1F5F9, texto #64748B
- Em andamento/Confirmado: fundo #DBEAFE, texto #2563EB

### Estado vazio — sempre: ícone + título + subtítulo + botão de ação primária

### Valores monetários
- Sempre alinhados à direita
- Formato: R$ 1.200,00
- Saídas em vermelho #DC2626, entradas em verde #16A34A
- Totais em negrito

### Checklist antes de declarar tabela pronta
- [ ] Descrição presente (tabelas financeiras)
- [ ] Ações sempre visíveis (Editar + Excluir/Desativar)
- [ ] Status como badge colorido
- [ ] Valores alinhados à direita e formatados BRL
- [ ] Estado vazio com ícone + título + subtítulo + botão
- [ ] Confirmação antes de ação destrutiva
- [ ] Validado via Playwright com screenshot real

## REGRA DE ACESSO A PRODUÇÃO
A partir de 2026-06-30, toda ação em produção (migrations, queries de investigação/cleanup) é executada PELO Claude Code via DATABASE_URL pública de PRODUÇÃO fornecida pontualmente pelo usuário — nunca mais manualmente direto no Railway Console.
Motivo: garantir documentação automática de toda ação em DEVLOG.md (incidente de referência: reconciliação de schema em 2026-06-30).
A URL pública de produção NUNCA é commitada em nenhum arquivo do repositório.

## REGRA — DEPLOY DE CÓDIGO ≠ DEPLOY DE SCHEMA (separar sempre)
Push para `main` (deploy de código em produção) e `prisma migrate deploy` contra o banco de produção são DUAS AÇÕES INDEPENDENTES — uma nunca dispara a outra automaticamente neste projeto.
Sempre que um merge para `main` envolver mudança em `packages/database/prisma/schema.prisma` ou em `prisma/migrations/`, isso deve ser explicitamente sinalizado ao usuário como: "este deploy também requer `prisma migrate deploy` em produção — confirma quando posso rodar?"
Nunca assumir que uma migration aplicada em homolog também foi aplicada em produção, mesmo que o código já esteja lá.

## REGRA CRÍTICA — NENHUMA AÇÃO DESTRUTIVA EM PRODUÇÃO SEM APROVAÇÃO
Mesmo com acesso via DATABASE_URL configurado, NENHUMA migration ou ação destrutiva em produção roda sem aprovação explícita do usuário para aquela ação específica.

## FLUXO DE DEPLOY
- **Homolog** (staging): recebe todo código novo
- **Main** (produção): push só com aprovação explícita
- Fluxo padrão ao final de cada tarefa:
  ```bash
  git add <arquivos> && git commit -m "tipo(módulo): desc"
  git checkout homolog && git merge main && git push origin homolog && git checkout main
  ```

## Comandos

### Raiz (Turborepo)
```bash
npm run dev      # Inicia frontend (3000) + backend (3001) em paralelo
npm run build    # Build de produção de todos os apps
npm run lint     # ESLint em todos os apps
```

### Frontend (`apps/web/`)
```bash
npm run dev      # Next.js dev server na porta 3000
npx tsc --noEmit # Type-check (rodar após qualquer mudança de código)
npm run build
npm run lint
```

### Backend (`apps/api/`)
```bash
npm run dev      # NestJS + watch mode (nest start --watch)
npm run build    # Compila para dist/
npm run test     # Jest (sem test suite ainda; jest config existe mas testes são escassos)
npm run lint
```

### Database
```bash
# Rodar do root (schema em packages/database/prisma/schema.prisma)
npx prisma migrate dev --schema=packages/database/prisma/schema.prisma
npx prisma studio --schema=packages/database/prisma/schema.prisma
npx prisma generate --schema=packages/database/prisma/schema.prisma
```

## Arquitetura

### Monorepo (Turborepo + npm workspaces)
```
apps/
  web/    → Next.js 14 App Router (@milli/web)
  api/    → NestJS 10 + Fastify (@milli/api)
packages/
  database/     → schema Prisma + PrismaClient gerado
  shared-types/ → tipos compartilhados (ApiResponse<T>, enums)
  business-rules/ → regras de negócio (ainda não implementado)
```

`@milli/shared-types` e `@milli/database` são transpilados pelo Next.js via `transpilePackages`.

### Backend (NestJS)

**Fluxo de request obrigatório para rotas autenticadas:**
1. `TenantMiddleware` — lê `X-Tenant-Slug` do header, busca tenant no banco, anexa `req.tenant`
2. `JwtAuthGuard` — valida Bearer token, popula `req.user` com `{ sub, tenantId, email, role }`
3. Controller usa `@TenantFromJwt()` para extrair `tenantId` do JWT (não do middleware — o middleware é para rotas públicas como login)
4. `TransformInterceptor` — envolve toda resposta em `{ success: true, data: <retorno> }`
5. `HttpExceptionFilter` — formata erros

**Login não usa `X-Tenant-Slug`**: o tenant é detectado pelo email do usuário (busca `user.email` + `user.tenant` em conjunto).

**Padrão de módulo NestJS** (cada módulo em `src/modules/<nome>/`):
- `<nome>.module.ts` — imports, providers, controllers
- `<nome>.controller.ts` — rotas, usa `@UseGuards(JwtAuthGuard)`, `@TenantFromJwt()`
- `<nome>.service.ts` — lógica de negócio, acessa `DatabaseService` (PrismaClient extendido)
- `dto/` — classes com decorators class-validator

**DatabaseService** estende `PrismaClient` diretamente — usar `this.db.<model>.*()` nos services.

**Decimais do Prisma** chegam como `string` no JSON — sempre converter com `Number(valor ?? 0)`.

### Frontend (Next.js 14)

**Dois apps distintos dentro do mesmo codebase:**

| App | Route Group | Público |
|-----|-------------|---------|
| Dashboard (operador) | `(dashboard)`, `(clientes)`, `(agenda)`, etc. | Não — requer cookie `accessToken` |
| Booking (cliente final) | `(booking)` | Sim — qualquer um acessa |

**Feature flags** (`src/lib/features.ts`): `NEXT_PUBLIC_USE_REAL_API=true` ativa todos os módulos para usar a API real. Quando `false`, cada hook usa dados mock de `src/lib/*-mock.ts`. Todos os hooks checam `FEATURES.real<Módulo>` antes de fazer fetch.

**API Client** (`src/lib/api/client.ts`):
- Singleton `api` exportado com métodos `api.get<T>()`, `api.post<T>()`, `api.patch<T>()`, `api.delete<T>()`
- Injeta automaticamente `Authorization: Bearer` (de `localStorage.accessToken`) e `X-Tenant-Slug` (de `localStorage.tenantSlug`) em todo request
- Faz unwrap do envelope `{ success, data }` — callers recebem `data` diretamente
- Em 401 com token salvo: limpa localStorage, redireciona para `/login`

**Hooks de dados** (ex: `use-clientes.ts`): cada hook checa `FEATURES`, chama a API lib correspondente (`src/lib/api/<módulo>.ts`), e faz `toFrontend()` para mapear campos da API para o tipo frontend (guards para `null`, conversão de IDs para strings, etc.).

**Autenticação no frontend**: token salvo em `localStorage.accessToken` E em cookie `accessToken`. O `middleware.ts` usa o cookie para redirecionar rotas protegidas no servidor; o `ApiClient` usa localStorage no cliente.

### Multi-tenancy

Toda entidade no banco tem `tenantId`. Todos os services do backend recebem `tenantId` como primeiro parâmetro e filtram por ele em todas as queries. Nunca omitir `tenantId` em `findMany`/`findFirst`/`count`.

## URLs e Variáveis de Ambiente

| Variável | Onde | Valor |
|----------|------|-------|
| `NEXT_PUBLIC_API_URL` | frontend | URL do backend (homolog ou produção) |
| `NEXT_PUBLIC_USE_REAL_API` | frontend | `true` em produção/homolog |
| `DATABASE_URL` | backend | PostgreSQL (Railway) |
| `JWT_SECRET` | backend | segredo para assinar tokens |
| `JWT_EXPIRES_IN` | backend | ex: `8h` |

Ver seção **AMBIENTES — NÃO CONFUNDIR** acima para URLs e credenciais corretas por ambiente.

## Subagentes por Módulo

Cada subagente tem escopo fechado — lê `.agents/AGENT_<MÓDULO>.md` + `DEVLOG.md | tail -100`.

| Módulo | Arquivo agente | Modelo |
|--------|---------------|--------|
| Auth | `.agents/AGENT_AUTH.md` | sonnet |
| Dashboard | `.agents/AGENT_DASHBOARD.md` | haiku |
| Agenda | `.agents/AGENT_AGENDA.md` | haiku |
| Clientes | `.agents/AGENT_CLIENTES.md` | haiku |
| Profissionais | `.agents/AGENT_PROFISSIONAIS.md` | haiku |
| Serviços | `.agents/AGENT_SERVICOS.md` | haiku |
| Comandas | `.agents/AGENT_COMANDAS.md` | haiku |
| Financeiro | `.agents/AGENT_FINANCEIRO.md` | sonnet |
| Configurações | `.agents/AGENT_CONFIGURACOES.md` | haiku |
| Infra | `.agents/AGENT_INFRA.md` | sonnet |
| Booking | `.agents/AGENT_BOOKING.md` | sonnet |

## Arquivos Compartilhados (nunca editar em paralelo)

- `packages/database/prisma/schema.prisma` → apenas AGENT_INFRA
- `apps/web/src/lib/features.ts` → apenas orquestrador
- `apps/web/src/middleware.ts` → apenas AGENT_AUTH
- `DEVLOG.md` → todos (apenas `>>`, nunca sobrescrever)

## Design System (Frontend)

Cores hardcoded — nunca usar nomes Tailwind para estas:

| Token | Hex |
|-------|-----|
| Content primary | `#0F172A` |
| Content secondary | `#475569` |
| Muted | `#94A3B8`, `#64748B` |
| Border | `#E2E8F0` |
| Surface | `#F1F5F9`, `#F8FAFC` |
| Primary | `#2563EB` / hover `#1D4ED8` |
| Primary light | `#DBEAFE` (focus rings) |
| Danger | `#DC2626`, `#EF4444` |
| Success | `#10B981`, `#16A34A` |

- **Focus ring obrigatório**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]`
- **Valores monetários**: classe `.font-tabular` (tabular-nums)
- **Animações**: `transition-colors duration-150 motion-reduce:transition-none`
- **Sidebar**: única área com CSS custom properties (`--color-sidebar-*`) definidas em `globals.css`

## Padrões Críticos

### `toFrontend()` nos hooks
A API retorna campos `null` que causariam crash em `.length`/`.map()`. Todo hook que consome a API deve ter um mapper `toFrontend()` com guards: `String(raw.field ?? '')`, arrays como `[]`, etc.

### `MonthKey` no Financeiro
Dados históricos keyed por `'jan-26' | 'fev-26' | ...`. Sempre tipado como `useState<string>` — nunca deixar TypeScript inferir a union, ou conflita com `MonthFilter.onChange: (month: string) => void`.

### Smart Forms
Forms multi-step em `apps/web/src/components/shared/`:
`smart-form-servico.tsx` (4 steps), `smart-form-profissional.tsx` (4 steps), `smart-form-categoria.tsx` (2 steps), `smart-form-meta.tsx` (2 steps), `smart-form-salao.tsx` (3 steps), `smart-form-app-cliente.tsx` (4 steps).

### Configurações primitivos
`src/components/configuracoes/_primitives.tsx`: `Toggle`, `SaveButton`, `FieldLabel`, `TextInput`, `SelectInput`, `SectionCard`, `useSaveState`. Usar em todos os componentes de configurações.
