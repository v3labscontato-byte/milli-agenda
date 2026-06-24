# Product

## Register

product

## Users

Donos de salão, recepcionistas e profissionais de beleza (cabeleireiros, esteticistas, manicures) que gerenciam operações diárias em salões, clínicas de estética e studios. Contexto de uso: ambiente de trabalho movimentado, frequentemente em pé ou com as mãos ocupadas, alternando entre atendimento ao cliente e consulta rápida na tela. O tempo de atenção é curto — toda ação deve ser completada em segundos, não minutos.

## Product Purpose

Plataforma multi-tenant de gestão de agenda e operações para o mercado de beleza. Cobre o ciclo completo: agendamento → check-in → serviço → comanda → pagamento → relatório. Sucesso significa que o profissional nunca perde um horário, o recepcionista fecha o caixa sem retrabalho, e o dono do salão vê os KPIs do dia em uma tela.

## Brand Personality

Ágil, Clara, Descomplicada. Tom direto e operacional — sem frescura, sem decoração desnecessária. A interface não deve "impressionar"; deve ser invisível enquanto o trabalho acontece.

## Anti-references

- **Fresha / Booksy**: UI densa de marketplace, parece vitrine para cliente final, não ferramenta de gestão profissional. Cores saturadas, CTAs de conversão onde deveriam estar ferramentas.
- **Dashboards de startup (gradientes, glassmorphism)**: Parecem demo de template Dribbble. Não sobrevivem ao uso real diário. Glassmorphism é proibido.
- **SaaS genérico neutro (estética Notion/Linear azul-e-branco)**: Sem identidade, sem senso de contexto do mercado de beleza. A clareza do Stripe é a referência certa — não a neutralidade vazia.

## Reference

**Stripe Dashboard**: densidade informacional alta, tipografia funcional forte, sem distrações visuais. A informação certa está sempre visível sem precisar navegar. Hierarquia por peso tipográfico e espaçamento, não por cards decorativos.

## Design Principles

1. **Operação em primeiro lugar** — Toda ação crítica (agendar, check-in, cobrar) deve ser completada em ≤ 3 interações. A interface nunca bloqueia o fluxo de trabalho.
2. **Status sempre legível** — Os 8 estados de agendamento (SCHEDULED → COMPLETED / CANCELLED) devem ser instantaneamente identificáveis por cor + ícone + label, nunca por cor sozinha.
3. **Densidade a serviço da clareza** — Alta densidade informacional no estilo Stripe, mas nunca poluída. Cada elemento na tela justifica seu espaço ou sai.
4. **Escala de complexidade** — Interface simples para o fluxo principal; features avançadas reveladas conforme o usuário avança. Nenhum iniciante se perde, nenhum usuário avançado fica preso.
5. **Confiança operacional** — Feedback, confirmações e estados de erro são completos e explícitos. Em um salão movimentado não há espaço para ambiguidade.

## Accessibility & Inclusion

WCAG AA como linha de base (contraste ≥ 4.5:1 para texto, reduced-motion suportado). Sem requisitos específicos além disso no momento. Nunca depender de cor como único sinal de estado — sempre usar ícone + label junto. Revisar quando houver usuários reais mapeados.
