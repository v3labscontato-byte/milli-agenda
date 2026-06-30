
## [2026-06-29] CLAUDE — Auditoria e fixes visuais: módulo de Comanda
**Status:** Concluído
**Arquivos alterados:**
- apps/web/src/components/shared/payment-modal.tsx
- apps/web/src/app/(comandas)/comandas/page.tsx

**O que foi feito:**
- Auditoria completa do módulo de comanda (page + modal)
- Fix visual: modal body bg-[#F8FAFC] -> bg-[#F1F5F9] para separar cards brancos do fundo
- Fix UX: icone Pencil (edição) substituido por X (remoção) no botão de remover item
- Fix read-only: itens, desconto e notas ocultos/bloqueados quando isCompleted=true
- Fix UX: grade de métodos de pagamento oculta em comandas fechadas (inutil nesse estado)
- Fix copy: hint "Selecione forma de pagamento" separado de "Comanda finalizada" (verde com check)
- Fix UI: botão "Confirmar Pagamento" oculto em comandas fechadas
- Fix data: deposit.paidAt formatado como DD/MM/YYYY em vez de ISO string crua

**Problemas encontrados:** Nenhum (tsc --noEmit limpo)
**Próximo passo sugerido:** Fix kpis() relatorios.service.ts para usar command.finalAmount em vez de service.price

## [2026-06-30] CLAUDE — style(produtos): modernizar ProdutoModal seguindo padrão visual do PaymentModal
**Status:** Concluído
**Arquivo alterado:**
- apps/web/src/components/produtos/produto-modal.tsx

**O que foi feito:**
- Extraídos tokens visuais do PaymentModal antes de editar
- Reescrito ProdutoModal com padrão visual PaymentModal:
  - Panel bg-[#F1F5F9] (antes bg-white)
  - Animação de entrada via useState(visible) + requestAnimationFrame
  - Header h-10 w-10 rounded-xl + subtítulo descritivo
  - 5 SectionCards com ícone+título: Informações Gerais, Preço e Unidade, Estoque, Classificações, Detalhes e Imagem
  - Inputs rounded-lg (antes rounded-md)
  - Botões rounded-xl com shadow azul no primário
  - Chips de classificação com shadow dupla no estado ativo
- tsc --noEmit: 0 erros
- Lógica de negócio, hooks, API e validações intocados

## [2026-06-30] CLAUDE — feat(comandas): Onda E — integração Produto↔Comanda com baixa automática de estoque
**Status:** Concluído
**Fecha:** causa raiz do bug original (itens extras descartados por falta de productId real)

**Backend alterado:**
- apps/api/src/modules/comandas/dto/add-item.dto.ts: serviceId e productId opcionais com validação mutuamente exclusiva (ValidateIf)
- apps/api/src/modules/comandas/comandas.module.ts: importa ProdutosModule
- apps/api/src/modules/comandas/comandas.service.ts:
  - Constructor injeta ProdutosService
  - addItem(): aceita productId com validação de estoque + decremento via adjustStock(-qty)
  - removeItem(): devolve estoque se item tiver productId (adjustStock(+qty))
  - cancel(): devolve estoque de todos os items com productId
  - findAll()/findOne(): include product:true nos items

**Frontend alterado:**
- apps/web/src/components/shared/add-item-modal.tsx: aba Produtos busca GET /products real, exibe estoque, desabilita sem estoque, catálogo hardcoded removido, productId propagado via onAdd
- apps/web/src/components/shared/payment-modal.tsx: PaymentItem e PaymentResult incluem productId, localItems propaga productId
- apps/web/src/app/(comandas)/comandas/page.tsx: filtro extraItems aceita !!productId, body envia productId quando aplicável, erro de estoque exibido via alert
- apps/web/src/app/(dashboard)/agenda/page.tsx: idem
- apps/web/src/components/agenda-table.tsx: idem
- apps/web/src/components/agenda/appointment-modal.tsx: idem

**tsc --noEmit: 0 erros (frontend e backend)**

## [2026-06-30] CLAUDE — fix(comandas): produto some ao reabrir comanda + sem limite de qtd no AddItemModal
**Status:** Concluído
**Arquivos:**
- apps/web/src/app/(comandas)/comandas/page.tsx
- apps/web/src/components/shared/add-item-modal.tsx

**Bug 1 — nome vazio ao reabrir comanda com produto:**
openPaymentModal usava i.service?.name ?? i.name ?? '' para mapear nome dos items.
CommandItem não tem campo 
ame; para items de produto i.service é null. Resultado: name=''.
Fix: i.service?.name ?? i.product?.name ?? ''

**Bug 2 — input de quantidade sem max no AddItemModal:**
Quantidade podia ser qualquer valor; validação só no backend.
Fix: max={tab==='product' && selected?.stock != null ? selected.stock : undefined}

## [2026-06-30] CLAUDE — Fix definitivo: hook compartilhado para busca de dados reais da comanda
**Status:** Concluído
**Arquivos alterados:**
- apps/web/src/hooks/use-comanda-detalhe.ts (NOVO)
- apps/web/src/components/agenda-table.tsx
- apps/web/src/app/(dashboard)/agenda/page.tsx
- apps/web/src/components/agenda/appointment-modal.tsx
- apps/web/src/app/(comandas)/comandas/page.tsx

**O que foi feito:**
- Criado hook `useComandaDetalhe` que encapsula fetch de `GET /commands/:id` e mapeia itens reais (serviceId, productId, desconto, depósito)
- 3 pontos de entrada que usavam itens estáticos da listagem agora buscam dados reais da API: agenda-table.tsx, agenda/page.tsx, appointment-modal.tsx
- comandas/page.tsx refatorada: openPaymentModal virou wrapper fino do hook, eliminando ~30 linhas de lógica duplicada
- clearDetalhe() chamado em todas as saídas (onClose, onReopen, confirm) para evitar estado stale
- TypeScript: 0 erros
