# AGENT_CONFIGURACOES — Milli Agenda

## IDENTIDADE
Agente especializado em Configurações do Milli Agenda.
Modelo recomendado: claude-haiku-4-5-20251001

## PRIMEIRA AÇÃO OBRIGATÓRIA
cat DEVLOG.md | tail -100

## MEU ESCOPO — Arquivos que posso editar
### Frontend
- apps/web/src/app/(dashboard)/configuracoes/page.tsx
- apps/web/src/components/configuracoes/ (todos)
- apps/web/src/components/shared/smart-form-salao.tsx
- apps/web/src/components/shared/smart-form-app-cliente.tsx
- apps/web/src/hooks/use-configuracoes.ts
- apps/web/src/lib/api/configuracoes.ts

### Backend
- apps/api/src/modules/settings/ (se existir)

## ENDPOINTS DO MEU MÓDULO
- GET /api/v1/settings → dados do tenant (name, email, phone, logoUrl, plan, trialEndsAt)
- PATCH /api/v1/settings → atualizar dados do tenant
- GET /api/v1/professionals/roles → roles (aba Tipos de Prof.)
- POST/PATCH/DELETE /api/v1/professionals/roles/:id
- GET /api/v1/services/categories → categorias (aba Categorias Serv.)
- POST/PATCH/DELETE /api/v1/services/categories/:id

## ESTADO ATUAL DO MÓDULO
✅ 10 abas de configuração
✅ Aba Meu Salão: dados reais do tenant com loading/error/saving
✅ Aba Plano: plano real (FREE/STARTER/PROFESSIONAL/ENTERPRISE) + trial countdown
✅ Aba Tipos de Profissionais: CRUD completo com /professionals/roles
✅ Aba Categorias de Serviços: CRUD completo com /services/categories + color picker
✅ Smart Form Salão 3 steps com ViaCEP
✅ Smart Form App Cliente 4 steps (Aparência, Carrossel, Políticas, URL)

## PADRÕES DO MÓDULO
- Primitivos em _primitives.tsx: Toggle, SaveButton, FieldLabel, TextInput, SelectInput, SectionCard
- useSaveState(): idle → saving → saved → idle (800ms)
- SectionCard: p-6, rounded-lg border border-[#E2E8F0]
- Abas: Meu Salão, Horários, Notificações, Pagamentos, Site Booking, Plano, API & Integ., LGPD, Tipos de Prof., Categorias Serv.

## BACKLOG DO MÓDULO
- [ ] Horários de funcionamento (CRUD Schedule)
- [ ] WhatsApp Business real (API Meta)
- [ ] SMTP real (SendGrid/Resend)
- [ ] Billing/subscription real
- [ ] Upload logo do salão (S3/R2)

## REGRAS INVIOLÁVEIS
1. NUNCA editar schema.prisma ou arquivos de outros módulos
2. SEMPRE npx tsc --noEmit → 0 erros
3. SEMPRE >> DEVLOG.md
4. SEMPRE git push origin main

## PASSO FINAL OBRIGATÓRIO
npx tsc --noEmit → 0 erros
git add [arquivos] DEVLOG.md && git commit -m "tipo(configuracoes): desc" && git push origin main
