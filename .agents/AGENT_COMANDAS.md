# AGENT_COMANDAS — Milli Agenda

## IDENTIDADE
Agente especializado em Comandas do Milli Agenda.
Modelo recomendado: claude-haiku-4-5-20251001

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(comandas)/comandas/page.tsx
- apps/web/src/components/comandas/ (todos)
- apps/web/src/hooks/use-comandas.ts
- apps/web/src/lib/api/comandas.ts

### Backend
- apps/api/src/modules/comandas/ (todos)

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/commands → array de comandas
- POST /api/v1/commands → { clientId, professionalId?, serviceId? }
- POST /api/v1/commands/:id/items → { serviceId, quantity, unitPrice }
- POST /api/v1/commands/:id/close
- POST /api/v1/commands/:id/cancel
- POST /api/v1/payments → { commandId, method, amount }

## ESTADO ATUAL DO MÓDULO
✅ Lista com tabela e filtros de status
✅ Modal abertura de comanda com dropdown de clientes e serviços reais
✅ Modal adição de itens
✅ Modal fechamento com cálculo de total
✅ Modal pagamento (PIX/Crédito/Débito/Dinheiro)
✅ Empty state com CTA Nova Comanda

## PADRÕES DO MÓDULO
- totalAmount, finalAmount: Decimal → sempre Number(c.totalAmount ?? 0)
- Status flow: OPEN → IN_PROGRESS → CLOSED | CANCELLED
- Pagamento: POST /payments com commandId + method + amount

## BACKLOG DO MÓDULO
- [ ] Desconto em itens individuais
- [ ] Múltiplos pagamentos por comanda (split)
- [ ] Impressão de recibo

## REGRAS INVIOLÁVEIS
1. NUNCA editar fora do escopo
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git checkout homolog && git merge main && git push origin homolog && git checkout main

## GUARD — Criação de Comanda (aprendizado [2026-06-30])
**TODO `handlePaymentConfirm` que chama `POST /commands` DEVE verificar `commandId` existente antes:**
```ts
// ✅ CORRETO — evita criar C2 quando C1 já existe
let commandId: string | undefined = appt.commandId
if (!commandId) {
  const res = await fetch(`${base}/api/v1/commands`, { method: 'POST', ... })
  commandId = (await res.json()).data?.id
}
if (!commandId) throw new Error('Comanda não criada')

// ❌ ERRADO — sempre cria/abre, orphanando comanda existente se ela estiver CLOSED
const res = await fetch(`${base}/api/v1/commands`, { method: 'POST', ... })
const commandId = (await res.json()).data?.id
```
**Por quê:** `open()` no backend só retorna comanda existente se `status === OPEN|IN_PROGRESS`. Se a comanda estiver CLOSED (reopen falhou silenciosamente), uma C2 é criada, `appointment.commandId` é atualizado para C2, e C1 fica orphanada com todos os dados (itens + pagamentos).

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(comandas): desc" && git checkout homolog && git merge main && git push origin homolog && git checkout main
