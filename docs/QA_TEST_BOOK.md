# Caderno de Testes — Milli Agenda (MVP)

> Critério de aceite oficial. Qualquer agente (Claude, Cursor, Copilot) ou QA humano deve usar este documento para validar que cada funcionalidade opera corretamente e que não houve regressão antes do merge para `main`.

## Objetivo

Garantir consistência entre:
- Frontend (Next.js)
- Backend (NestJS/API)
- Banco de Dados (Prisma/PostgreSQL)
- Dashboards e KPIs
- Relatórios e Financeiro
- Regras de negócio

**Script de regressão automatizado:** `tests/api/regression.sh`
**Cobertura automatizada:** Suítes 01, 02, 04, 05, 06, 07, 08, 09, 14 (endpoints REST)
**Cobertura manual/E2E:** Suítes 03, 10, 11, 12, 13, 15, 16, 17

---

## SUÍTE 01 — Autenticação e Onboarding

| # | Caso | Pré-condição | Passos | Resultado esperado |
|---|------|-------------|--------|-------------------|
| 1.1 | Login válido | Usuário cadastrado | POST /auth/login com credenciais corretas | HTTP 200 + accessToken |
| 1.2 | Senha inválida | Usuário cadastrado | POST /auth/login com senha errada (qualquer tamanho) | HTTP 401 + mensagem de erro |
| 1.3 | Usuário inexistente | — | POST /auth/login com e-mail não cadastrado | HTTP 401 |
| 1.4 | Esqueci minha senha | Usuário cadastrado | POST /auth/forgot-password → validar token → POST /auth/reset-password → login | HTTP 200 em cada etapa; login funciona com nova senha |
| 1.5 | Cadastro novo usuário | — | POST /auth/register com nome, e-mail, senha, confirmação | HTTP 201; usuário criado no banco |
| 1.6 | Onboarding completo | Usuário novo | GET /auth/onboarding → selecionar nicho → verificar importação | HTTP 200; cargos + categorias + serviços importados no tenant |

**Validações automáticas:** 1.1, 1.2, 1.3 cobertas pelo `regression.sh`.
**Validações manuais:** 1.4 (reset de senha via e-mail), 1.5 (UI de cadastro), 1.6 (fluxo de onboarding).

---

## SUÍTE 02 — Profissionais

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 2.1 | Criar profissional (campos obrigatórios) | HTTP 201; profissional aparece em GET /professionals |
| 2.2 | Criar profissional (campos completos: nome, foto, CPF, telefone, e-mail, cargo, comissão, escala, horário, data contratação) | HTTP 201; todos os campos persistidos |
| 2.3 | Editar profissional | PATCH retorna 200; campos atualizados |
| 2.4 | Excluir profissional sem agenda futura | DELETE retorna 200 |
| 2.5 | Excluir profissional com agenda futura | HTTP 409 ou 400 com mensagem explicativa |
| 2.6 | Adicionar serviços habilitados ao profissional | Serviço aparece na agenda do profissional |
| 2.7 | Editar comissão | Novo percentual reflete nos relatórios de comissão |
| 2.8 | Alterar escala/horário | Agenda atualiza disponibilidade do profissional |

---

## SUÍTE 03 — Categorias

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 3.1 | Criar categoria | HTTP 201 |
| 3.2 | Editar categoria | HTTP 200; nome atualizado |
| 3.3 | Excluir categoria sem serviços | HTTP 200 |
| 3.4 | Excluir categoria com serviços ativos | HTTP 409 + mensagem "categoria possui serviços ativos" |

---

## SUÍTE 04 — Serviços

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 4.1 | Cadastrar serviço (nome, categoria, preço, tempo, cor, imagem, profissionais) | HTTP 201; todos os campos persistidos |
| 4.2 | Editar serviço | HTTP 200; alterações refletem em novos agendamentos |
| 4.3 | Arquivar serviço | Serviço some da listagem ativa; agendamentos antigos mantidos |
| 4.4 | Excluir serviço | HTTP 200 |
| 4.5 | Duplicar serviço | Novo serviço criado com mesmos atributos |
| 4.6 | Editar preço | Novo agendamento usa preço novo; agendamentos anteriores mantêm valor original |

---

## SUÍTE 05 — Clientes

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 5.1 | Cadastrar cliente | HTTP 201 |
| 5.2 | Editar cliente | HTTP 200; dados atualizados |
| 5.3 | Excluir cliente | HTTP 200 |
| 5.4 | Pesquisar por nome/telefone | Retorna apenas os clientes que batem com o filtro |
| 5.5 | Importar clientes (CSV) | Clientes criados em lote; erros relatados por linha |
| 5.6 | Detectar duplicidade | Sistema alerta ao criar cliente com mesmo telefone/e-mail |
| 5.7 | Histórico de atendimentos | GET /clients/:id/historico retorna agendamentos + comandas |
| 5.8 | LGPD — exportar dados | JSON com todos os dados do cliente |
| 5.9 | LGPD — anonimizar | Campos pessoais substituídos por hash |

---

## SUÍTE 06 — Agenda

### Visão Hoje / Dia

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 6.1 | Criar agendamento (hoje) | HTTP 201; aparece na timeline do dia correto |
| 6.2 | Editar agendamento | HTTP 200; timeline atualiza |
| 6.3 | Cancelar agendamento | Status → CANCELLED; cor muda na agenda |
| 6.4 | Reagendar (alterar data/hora) | Status mantido; novo horário reflete |
| 6.5 | Confirmar agendamento | Status → CONFIRMED |
| 6.6 | Marcar não compareceu | Status → NO_SHOW |
| 6.7 | Concluir atendimento | Status → COMPLETED |

### Campos visuais a validar
- Cor do card por status (SCHEDULED=azul, CONFIRMED=roxo, IN_SERVICE=verde, COMPLETED=verde-claro, CANCELLED=vermelho)
- Horário de início e duração corretos
- Nome do cliente, profissional e serviço exibidos

### Visão Semana

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 6.8 | Mudar de semana (anterior/próxima) | Agendamentos da semana selecionada aparecem |
| 6.9 | Filtrar por profissional | Apenas agendamentos do profissional selecionado |
| 6.10 | Clicar em dia específico | Abre visão diária daquele dia |

### Conflitos e Bloqueios

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 6.11 | Mesmo horário, mesmo profissional | HTTP 409 "conflito de horário" |
| 6.12 | Horário fora da escala do profissional | HTTP 400 "profissional indisponível" |
| 6.13 | Dia de folga / férias | HTTP 400 |

---

## SUÍTE 07 — Comanda

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 7.1 | Abrir comanda via clientId | HTTP 201; status OPEN |
| 7.2 | Abrir comanda via appointmentId | HTTP 201; clientId resolvido automaticamente |
| 7.3 | Adicionar serviço | HTTP 201; totalAmount atualizado |
| 7.4 | Adicionar produto | HTTP 201; totalAmount atualizado |
| 7.5 | Remover item | HTTP 200; totalAmount recalculado |
| 7.6 | Editar quantidade de item | HTTP 200; total recalculado |
| 7.7 | Aplicar desconto (valor fixo) | finalAmount = totalAmount − desconto |
| 7.8 | Aplicar desconto (percentual) | finalAmount correto |
| 7.9 | Fechar comanda | Status → CLOSED; closedAt preenchido |
| 7.10 | Cancelar fechamento | Comanda volta para OPEN |
| 7.11 | Pagar com único método (PIX) | Pagamento registrado; status → PAID |
| 7.12 | Pagar com múltiplas formas (PIX R$50 + Cartão R$80 = R$130) | Dois pagamentos; soma = totalAmount |
| 7.13 | Cancelar comanda | Status → CANCELLED |

### Estados válidos
`OPEN → IN_PROGRESS → AWAITING_PAYMENT → CLOSED | CANCELLED`

---

## SUÍTE 08 — Financeiro

| # | Caso | Validação |
|---|------|-----------|
| 8.1 | KPIs do dia atual | totalAppointments, completedAppointments, todayRevenue, ticketMedio |
| 8.2 | KPIs de data específica | Mesmos campos, filtrando pela data informada |
| 8.3 | Receita bruta (mês atual) | Soma dos pagamentos PAID no período |
| 8.4 | Receita com período personalizado | from / to passados como query params |
| 8.5 | Fluxo de caixa (entradas por dia) | Array ordenado por data; saldo acumulado correto |
| 8.6 | Comissões por profissional | pctComissao × receita = comissaoValue |
| 8.7 | Ocupação por status | Soma de todos os status = total de agendamentos |
| 8.8 | Inadimplência | Agendamentos concluídos sem pagamento; daysOverdue correto |
| 8.9 | Metas — listar | GET /reports/goals → HTTP 200 |
| 8.10 | Metas — criar | POST /reports/goals com tipo/periodo/valor → HTTP 201 |
| 8.11 | Metas — excluir | DELETE /reports/goals/:id → HTTP 200 |

---

## SUÍTE 09 — Dashboard

Todos os indicadores do dashboard devem **bater com o banco** na mesma janela temporal.

| # | Indicador | Como validar |
|---|-----------|-------------|
| 9.1 | Agendamentos hoje | COUNT(*) WHERE date = today; comparar com dashboard |
| 9.2 | Clientes atendidos | COUNT DISTINCT clientId em appointments COMPLETED |
| 9.3 | Receita do dia | SUM(payments.amount) WHERE paidAt = today |
| 9.4 | Taxa de ocupação | completedAppts / totalAppts × 100 |
| 9.5 | Ticket médio | receita / completedAppts |
| 9.6 | A receber | Agendamentos sem pagamento associado |
| 9.7 | Gráfico de receita | Série temporal bate com tabela payments |
| 9.8 | Gráfico por método pagamento | PIX + Dinheiro + Débito + Crédito = total |
| 9.9 | **NOVO** Agendamentos por status | COUNT por cada status; soma = total |
| 9.10 | Serviços mais populares | Ranking por frequência de agendamentos concluídos |
| 9.11 | Profissionais mais produtivos | Ranking por receita e atendimentos concluídos |

---

## SUÍTE 10 — Configurações

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 10.1 | Editar dados cadastrais (nome, telefone, endereço) | HTTP 200; GET /settings retorna valores atualizados |
| 10.2 | Configurar horários de funcionamento | Agenda respeita horários configurados |
| 10.3 | Ativar/desativar formas de pagamento | Apenas métodos ativos aparecem no fechamento de comanda |
| 10.4 | Gerar API Key | Key criada; revogação invalida key |
| 10.5 | Notificações — configurar canais | WhatsApp / E-mail habilitados/desabilitados por evento |
| 10.6 | Site Booking — configurar URL slug | URL pública disponível em /booking/:slug |
| 10.7 | Permissões por papel | Profissional não acessa financeiro; gerente não acessa admin |

---

## SUÍTE 11 — Site de Agendamento (Booking Público)

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 11.1 | Acessar URL pública | Página carrega sem autenticação |
| 11.2 | Selecionar profissional → serviço → horário → confirmar | Agendamento criado; confirmação exibida ao cliente |
| 11.3 | Cancelar agendamento pelo cliente | Status → CANCELLED; profissional notificado |
| 11.4 | Reagendar pelo cliente | Novo horário disponível; conflitos checados |
| 11.5 | Responsividade mobile | Layout funciona em 320px, 375px, 428px |

---

## SUÍTE 12 — Relatórios

| # | Caso | Resultado esperado |
|---|------|--------------------|
| 12.1 | Relatório de receita filtrado por período | Totais batem com pagamentos no banco |
| 12.2 | Relatório de serviços mais vendidos | Ranking correto por quantidade e receita |
| 12.3 | Relatório de clientes | Novos x recorrentes; ticket médio por cliente |
| 12.4 | Relatório de profissionais | Atendimentos + receita + comissão por profissional |
| 12.5 | Exportar CSV | Arquivo gerado com todos os registros do filtro |
| 12.6 | Exportar PDF | PDF gerado com layout correto |

---

## SUÍTE 13 — Permissões

| Papel | Pode | Não pode |
|-------|------|----------|
| Administrador | Tudo | — |
| Gerente | CRUD profissionais, serviços, clientes, agenda, financeiro | Excluir tenant, gerenciar API keys |
| Profissional | Ver própria agenda, abrir/fechar comanda | Ver financeiro de outros, editar serviços |
| Atendente | Criar/editar agendamentos, abrir comanda | Ver financeiro, editar profissionais |
| Cliente (booking) | Ver própria agenda, cancelar/reagendar | Acessar dashboard |

---

## SUÍTE 14 — APIs (Contrato REST)

Para cada endpoint, validar:

| Verificação | Detalhe |
|-------------|---------|
| Status HTTP correto | 200 GET, 201 POST, 400 validação, 401 não autenticado, 403 sem permissão, 404 não encontrado, 409 conflito |
| Envelope de resposta | `{ "success": true, "data": ... }` em todos os endpoints |
| Paginação | `page` e `perPage` funcionam; `total` retornado |
| Filtros | `from`, `to`, `status`, `professionalId`, `clientId` funcionam |
| Ordenação | `orderBy` respeitado |
| Tenant isolation | Token de tenant A não acessa dados do tenant B |
| Campos obrigatórios | 400 com mensagem descritiva quando ausentes |
| Campos desconhecidos | Ignorados (não causam erro, não persistidos — `whitelist: true`) |

---

## SUÍTE 15 — Banco de Dados

Para cada operação CRUD, validar diretamente no banco:

| Verificação | SQL / Prisma |
|-------------|-------------|
| Registro criado | `SELECT * FROM "table" WHERE id = ?` |
| tenantId correto | Isolamento multi-tenant garantido |
| createdAt preenchido | Não nulo; próximo de NOW() |
| updatedAt atualizado | > createdAt após PATCH |
| Soft delete | `deletedAt` preenchido (quando aplicável) |
| FK válida | clientId, professionalId, serviceId existem no mesmo tenant |
| Sem vazamento entre tenants | SELECT por tenantId alheio retorna 0 registros |

---

## SUÍTE 16 — Performance

| Endpoint | SLA aceitável |
|----------|--------------|
| POST /auth/login | < 500ms |
| GET /appointments (dia) | < 300ms |
| GET /reports/kpis | < 500ms |
| GET /reports/revenue | < 800ms |
| GET /professionals | < 200ms |
| Pesquisa de clientes | < 300ms |

---

## SUÍTE 17 — Regressão

Após qualquer merge para `main`:

```bash
bash tests/api/regression.sh
```

Critério de aceite: **100% PASS** nas suítes automatizadas (API). Falhas bloqueiam o merge.

---

## CHECKLIST FINAL — Smoke Test Completo

Antes de declarar uma versão pronta para homologação, executar o fluxo ponta a ponta:

- [ ] 1. Criar tenant + concluir onboarding; verificar importação de cargos, categorias e serviços
- [ ] 2. Configurar dados do estabelecimento (logo, horários, formas de pagamento)
- [ ] 3. Cadastrar profissional com escala, comissão e serviços habilitados
- [ ] 4. Criar nova categoria de serviço
- [ ] 5. Cadastrar serviço (vinculado à categoria e ao profissional)
- [ ] 6. Cadastrar cliente
- [ ] 7. Criar agendamento para hoje
- [ ] 8. Verificar agendamento na visão diária (hora e cor corretos)
- [ ] 9. Verificar mesmo agendamento na visão semanal
- [ ] 10. Editar agendamento
- [ ] 11. Reagendar para outro horário
- [ ] 12. Cancelar agendamento de teste; validar status CANCELLED
- [ ] 13. Criar novo agendamento válido
- [ ] 14. Abrir comanda do atendimento
- [ ] 15. Adicionar serviço extra à comanda
- [ ] 16. Adicionar produto à comanda
- [ ] 17. Aplicar desconto
- [ ] 18. Efetuar pagamento em duas formas (PIX R$50 + Cartão R$80 = R$130)
- [ ] 19. Fechar comanda
- [ ] 20. Validar KPIs do Dashboard (agendamentos, receita, ocupação, ticket médio)
- [ ] 21. Validar Financeiro (receita, fluxo de caixa, comissões, metas)
- [ ] 22. Validar Relatórios (totais batem com Dashboard e banco)
- [ ] 23. Testar Site de Agendamento público (agendamento ponta a ponta)
- [ ] 24. Revisar logs da API — sem erros 5xx
- [ ] 25. Confirmar isolamento de tenant (token de outro tenant não acessa dados)

---

## Status de Implementação (referência)

| Funcionalidade | API | Frontend | Observação |
|---------------|-----|----------|------------|
| Login / JWT | ✅ | ✅ | |
| Profissionais CRUD | ✅ | ✅ | |
| Serviços CRUD | ✅ | ✅ | |
| Clientes CRUD | ✅ | ✅ | |
| Agenda (criar/editar/status) | ✅ | ✅ | |
| Comandas (abrir/fechar) | ✅ | ✅ | |
| Pagamentos | ✅ | Parcial | |
| KPIs / Dashboard | ✅ | ✅ | |
| Relatórios financeiros | ✅ | ✅ | |
| Metas | ✅ | ✅ | Migration pendente no Railway |
| Forgot password | ❌ | ❌ | Não implementado |
| Produtos em comanda | ❌ | ❌ | Não implementado |
| Múltiplos pagamentos | ❌ | Parcial | |
| Exportação CSV/PDF | ❌ | ❌ | Não implementado |
| Permissões por papel | ❌ | ❌ | Não implementado |
| Booking público | ✅ | Parcial | |
| Site config (API Keys, notificações) | Parcial | Partial | |
