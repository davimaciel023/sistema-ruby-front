# Forró Ruby — Frontend (Angular)

Interface web do sistema de gestão da banda Forró Ruby. Angular 21 (standalone + signals) + Tailwind CSS 4, tema escuro rubi, 100% responsivo.

## Como rodar

O backend precisa estar no ar em `http://localhost:8012` (ver `sistema-ruby-back/README.md`).

```bash
npm install
npm start          # http://localhost:4200
```

Build de produção: `npm run build` (sai em `dist/forro_ruby`). A URL da API fica em `src/app/core/config/api.config.ts` — troque ao publicar no VPS.

## Arquitetura (MVVM)

```
src/app/
├── core/
│   ├── auth/          # AuthService (JWT + signals), interceptor, guard
│   ├── config/        # api.config.ts (URL da API)
│   ├── models/        # interfaces espelhando a API
│   └── services/      # services compartilhados (members)
├── shared/icons/      # ícones SVG reutilizáveis (icons.ts + IconComponent) — sem emojis
├── layout/            # ShellComponent (sidebar + topbar responsivos)
└── features/<nome>/
    ├── services/      # chamadas HTTP da feature
    ├── <nome>.viewmodel.ts   # estado via signal/computed
    ├── <nome>.component.ts   # injeta a ViewModel (providers próprios)
    └── <nome>.component.html
```

## Telas

| Rota | Feature |
|---|---|
| `/login` | Login (JWT) |
| `/dashboard` | Alertas de prazo (atrasada/24h/48h), minhas tarefas, próximos eventos |
| `/tarefas` | CRUD de tarefas, filtro por integrante, comentários, concluir |
| `/agenda` | Shows/ensaios/lembretes/fixas; cachê, divisão entre os 3 e controle de quem recebeu |
| `/financeiro` | Saldo, receitas, despesas, cachês a receber, lançamentos |
| `/ponto` | Entrada/saída, meta diária 1h30 com barra de progresso, painel semanal da banda |
| `/estudo` | Biblioteca de materiais (link/vídeo/PDF/cifra) com status |
| `/conteudo` | Cronograma de postagens + ideias de vídeo |
| `/repertorio` | Cadastro de músicas (tom, duração, letra, cifra), montador com tempo de show e download do PDF |

## Convenções

- Ícones: sempre via `<app-icon name="..." />` — os SVGs vivem só em `shared/icons/icons.ts`.
- Estado: `signal`/`computed` nas ViewModels; componentes não têm lógica de negócio.
- Controle de fluxo: `@if` / `@for` (nunca `*ngIf`/`*ngFor`).
- Estilo: Tailwind puro, tema em `src/styles.css` (`@theme` com paleta `ruby`).
