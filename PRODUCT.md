# Product

## Register

product

## Users

**Operadores** (donos de salão, gerentes, recepcionistas): usam o dashboard no desktop para gerenciar agenda, comandas, clientes, profissionais, financeiro e configurações. Tarefa primária: visualizar e controlar o dia a dia do salão com o mínimo de cliques.

**Clientes finais**: acessam o Booking App no mobile (max-w-md) para agendar, ver histórico, acumular pontos e gerenciar perfil. Tarefa primária: agendar um serviço sem fricção.

## Product Purpose

Milli Agenda é uma plataforma SaaS de gestão para salões de beleza e clínicas estéticas. Integra agendamento online, gestão financeira, comissões, fidelidade e programa de afiliados em um único produto. Sucesso = operador consegue gerenciar o salão inteiro sem sair da plataforma; cliente agenda em menos de 60 segundos.

## Brand Personality

Ágil, Limpo, Direto. Tom funcional e confiante — sem floreios, sem texto decorativo. Comunica competência sem ser frio.

## Anti-references

- **Booksy / Fresha**: paleta saturada, estilo consumer-app, excesso de cor. Milli serve B2B primeiro.
- **Painéis CRUD genéricos**: tabelas sem hierarquia, sem estados, sem feedback visual. O oposto do que queremos.
- **iClinic / Doctoralia**: visual muito clínico/azul-pesado, complexidade desnecessária de formulários.
- **Glassmorphism / gradiente em texto / card grid com métricas hero**: slop de IA — evitar absolutamente.

## Design Principles

1. **Velocidade como respeito**: cada tela deve responder em 1 interação; sem modais desnecessários, sem confirmações redundantes.
2. **Hierarquia pela tipografia, não por decoração**: tamanho e peso comunicam importância — dispensar bordas coloridas, badges desnecessários.
3. **Estado visível sempre**: feedback síncrono em toda ação (SaveButton, loading, empty state, confirmação inline). O usuário nunca deve se perguntar "funcionou?".
4. **Defaults inteligentes**: o sistema vem configurado para o caso de uso típico de salão — o operador ajusta exceções, não o básico.
5. **Mobile do cliente, desktop do operador**: telas de booking são mobile-first (max-w-md, touch targets ≥ 44px); dashboard é desktop-first com sidebar colapsável.

## Accessibility & Inclusion

WCAG AA. Requisitos: contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande; todo elemento interativo com `focus-visible` explícito; `aria-label` em ícones sem texto; `prefers-reduced-motion` respeitado (já implementado via media query global e `motion-reduce:` Tailwind).
