# AGENT_PRODUTOS — Milli Agenda

## IDENTIDADE
Agente especializado no módulo de Produtos e Estoque do Milli Agenda.
Modelo recomendado: claude-haiku-4-5-20251001

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(dashboard)/produtos/page.tsx
- apps/web/src/components/produtos/ (todos)
- apps/web/src/hooks/use-produtos.ts
- apps/web/src/lib/api/produtos.ts

### Backend
- apps/api/src/modules/produtos/ (todos)

### Shared (só com aprovação do orquestrador)
- packages/database/prisma/schema.prisma (model Product)

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/products?onlyActive=true → lista produtos
- POST /api/v1/products → criar produto
- PATCH /api/v1/products/:id → editar produto
- DELETE /api/v1/products/:id → inativar produto

## ESTADO ATUAL DO MÓDULO

### Onda A+B — Schema + Backend CRUD ✅ (commit b60acac)
- Model Product: id, tenantId, name, description, classifications (String[]),
  supplierName, price (Decimal), stockQuantity (Int), active (Boolean)
- Migration aplicada em homolog com NOT NULL corrigido em classifications
- CRUD completo: create/findAll(onlyActive?)/findOne/update/adjustStock
- ProdutosModule importado em ComandasModule para injeção de ProdutosService

### Onda E — Integração Produto↔Comanda ✅ (commit 284a9be)
- addItem() aceita productId OU serviceId (ValidateIf no DTO)
- Fluxo de estoque: addItem debita (-qty), removeItem devolve (+qty), cancel devolve todos os produtos
- AddItemModal busca GET /products?onlyActive=true, mostra stock, desabilita sem estoque, max no qty input
- PaymentItem inclui productId opcional; extraItems filtrado por serviceId||productId

### Bug corrigido — Reenvio duplicado em reopen ✅ (mesmo dia da Onda E)
- Problema: handlePaymentConfirm reenviava itens já existentes na comanda (via detalhe) causando duplo débito
- Fix: filterNewItems() em use-comanda-detalhe.ts, aplicada nos 4 pontos de entrada

## PONTOS DE INTEGRAÇÃO COM OUTROS MÓDULOS

### comandas.service.ts (AGENT_COMANDAS gerencia — NÃO EDITAR aqui)
- addItem() valida estoque e chama adjustStock(-qty) via ProdutosService
- removeItem() chama adjustStock(+qty) se item tem productId
- cancel() restaura estoque de todos os itens com productId
- close() e reopen() NÃO tocam em estoque — débito é no addItem, não no close

## REGRAS CRÍTICAS
1. NUNCA duplicar lógica de estoque fora de comandas.service.ts
2. Débito de estoque ocorre EXCLUSIVAMENTE em addItem(), nunca em close()
3. Restauração ocorre em removeItem() e cancel() — NUNCA em reopen() (reopen não toca estoque)
4. adjustStock() em ProdutosService: delta positivo = devolve, delta negativo = debita
5. SEMPRE npx tsc --noEmit → 0 erros

## BACKLOG (Ondas pendentes)
- [ ] Onda C — Listagem frontend com filtros reais (categoria, status, estoque baixo)
- [ ] Onda D — Formulário de criação/edição real (SmartForm)
- [ ] Onda F — Edição de quantidade de item já existente na comanda (PATCH /commands/:id/items/:itemId)
- [ ] Onda G — Alertas de estoque baixo (threshold configurável)
- [ ] Onda H — Relatório de movimentação de estoque

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(produtos): desc"
git push origin homolog
