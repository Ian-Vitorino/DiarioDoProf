# Telas de parâmetros e modelo de dados

Este documento descreve as telas de cadastro (turmas, alunos, períodos e atividades) que o professor usa para configurar suas turmas antes de começar a lançar notas, junto com o modelo de dados que as suporta.

> Status: Telas implementadas em 2026-04-30. Parte operacional (lançamento de notas, médias, boletim) ainda não construída.

---

## 1. Visão geral

```
Login → /turmas (lista) → /turmas/[id] (detalhe) → tabs Alunos / Períodos / Atividades
```

O professor é o **tenant** do sistema. Todo dado dele (turmas, alunos, períodos, atividades, notas) carrega o `professorId` na própria tabela. Isso garante isolamento entre contas e permite que cada query filtre direto pelo tenant, sem JOINs em cascata.

---

## 2. Multi-tenancy

### Princípio

Todas as entidades de domínio têm uma coluna `professorId` que aponta direto para o `Professor` dono. Mesmo entidades "filhas" (Aluno, Periodo, Atividade, Nota) carregam o `professorId` da turma à qual pertencem.

### Por que denormalizar `professorId`

- **Queries simples** — toda consulta começa com `where: { professorId }`, sem precisar fazer JOIN com Turma para descobrir o dono.
- **Defesa em profundidade** — uma falha em um JOIN ou em uma cláusula complexa não vaza dado entre tenants.
- **Performance** — index em `professorId` por tabela faz scans de tenant rápidos.

### Como é aplicado no código

- Toda server action começa com `getProfessorIdOrThrow()` (em `lib/session.ts`)
- Mutações usam `prisma.<entidade>.updateMany` ou `findFirst` filtrando por `{ id, professorId }`. Se o registro não pertence ao professor, o resultado é "não encontrado".
- `revalidatePath` é chamado após mutações para refrescar o cache do Next.

### O que isso garante

- Professor A nunca vê dado de Professor B.
- Tentativa de editar/excluir um recurso passando um id de outro professor retorna erro genérico ("não encontrada"), sem leak.

---

## 3. Modelo de dados

### Diagrama de relações

```
Professor (tenant)
   │
   ├──< Turma  ─── status: ATIVA | CONCLUIDA
   │      ├──< Aluno
   │      ├──< Periodo
   │      │       └──< Atividade
   │      │              └──< Nota
   │      │                    │
   │      └──< (Aluno) ───────>┘     (Nota liga Aluno + Atividade)
   ▼
   (Cascade: deletar Professor apaga tudo)
```

### Entidades

#### `Professor`

Conta do usuário do sistema.

| Campo          | Tipo     | Notas                                   |
|----------------|----------|-----------------------------------------|
| `id`           | String   | UUID, PK                                |
| `email`        | String   | único, lowercase normalizado na entrada |
| `passwordHash` | String   | bcrypt (10 rounds)                      |
| `nome`         | String   |                                         |
| `createdAt`    | DateTime |                                         |
| `updatedAt`    | DateTime |                                         |

#### `Turma`

Uma turma de uma disciplina específica num ano letivo.

| Campo         | Tipo          | Notas                                   |
|---------------|---------------|-----------------------------------------|
| `id`          | String        | UUID, PK                                |
| `nome`        | String        | "9º Ano A"                              |
| `nivel`       | `NivelEnsino` | `FUNDAMENTAL` ou `MEDIO`                |
| `serie`       | String        | "9º", "1ª", livre                       |
| `disciplina`  | String        | "Matemática"                            |
| `ano`         | Int           | ano letivo (ex: 2026)                   |
| `status`      | `TurmaStatus` | `ATIVA` (default) ou `CONCLUIDA`        |
| `professorId` | String → FK   | dono                                    |

Index: `professorId`. Cascade: ao deletar Professor → todas as turmas dele somem.

#### `Aluno`

Aluno matriculado em uma turma específica.

| Campo         | Tipo        | Notas                              |
|---------------|-------------|------------------------------------|
| `id`          | String      | UUID, PK                           |
| `nome`        | String      |                                    |
| `matricula`   | String?     | opcional (identificador da escola) |
| `professorId` | String → FK | denormalizado da turma             |
| `turmaId`     | String → FK | turma à qual pertence              |

Index: `professorId`, `turmaId`. Cascade: deletar Turma → seus alunos somem.

> **Decisão atual:** o aluno está vinculado a **uma única turma**. Se o professor lecionar a mesma pessoa em duas turmas (ex: matemática e física), terá que cadastrar duas vezes. Modelo de "Aluno" como pessoa global + matrícula como vínculo é uma evolução futura — ver `contexto-inicial.md`.

#### `Periodo`

Bimestre, trimestre ou semestre da turma.

| Campo         | Tipo        | Notas                              |
|---------------|-------------|------------------------------------|
| `id`          | String      | UUID, PK                           |
| `nome`        | String      | "1º Bimestre"                      |
| `ordem`       | Int         | 1, 2, 3, 4 — ordena na exibição    |
| `professorId` | String → FK |                                    |
| `turmaId`     | String → FK |                                    |

Index: `professorId`, `turmaId`. Cascade: deletar Turma → períodos somem.

> Não há constraint de unicidade em `[turmaId, ordem]` — o professor pode ter duas linhas com a mesma ordem. Avaliar adicionar caso vire problema na UX.

#### `Atividade`

Avaliação dentro de um período (prova, trabalho, exercício, etc).

| Campo         | Tipo        | Notas                              |
|---------------|-------------|------------------------------------|
| `id`          | String      | UUID, PK                           |
| `nome`        | String      | "Prova mensal"                     |
| `valorMaximo` | Float       | default 10                         |
| `professorId` | String → FK |                                    |
| `periodoId`   | String → FK |                                    |

Index: `professorId`, `periodoId`. Cascade: deletar Período → atividades somem.

> **Sem `peso` por enquanto.** A regra de cálculo de média é simples (`soma das notas / quantidade`). Quando houver suporte a média ponderada, basta adicionar coluna `peso` nullable e migration de 1 linha.

#### `Nota`

Valor que um aluno tirou em uma atividade.

| Campo         | Tipo        | Notas                              |
|---------------|-------------|------------------------------------|
| `id`          | String      | UUID, PK                           |
| `valor`       | Float       | nota lançada                       |
| `professorId` | String → FK |                                    |
| `alunoId`     | String → FK |                                    |
| `atividadeId` | String → FK |                                    |

Constraint única: `[alunoId, atividadeId]` — um aluno só tem **uma** nota por atividade. Index: `professorId`. Cascade: deletar Aluno OU Atividade → notas somem.

### Enums

```prisma
enum NivelEnsino { FUNDAMENTAL, MEDIO }
enum TurmaStatus { ATIVA, CONCLUIDA }
```

### Cascade resumido

```
Professor ─delete──> tudo dele (turmas → alunos, periodos, atividades, notas)
Turma     ─delete──> alunos, periodos (e por consequência atividades + notas)
Periodo   ─delete──> atividades (e por consequência notas)
Aluno     ─delete──> notas dele
Atividade ─delete──> notas dela
```

---

## 4. Telas

### Mapa de rotas

| Rota                                  | Tipo   | Propósito                                       |
|---------------------------------------|--------|-------------------------------------------------|
| `/`                                   | server | Redireciona para `/turmas`                      |
| `/login`                              | client | Login com email/senha                           |
| `/signup`                             | client | Criar conta (auto-login após sucesso)           |
| `/turmas`                             | server | Lista de turmas do professor                    |
| `/turmas/[id]`                        | server | Redireciona para `/turmas/[id]/alunos`          |
| `/turmas/[id]/alunos`                 | server | Tab Alunos da turma                             |
| `/turmas/[id]/periodos`               | server | Tab Períodos da turma                           |
| `/turmas/[id]/atividades`             | server | Tab Atividades da turma (agrupadas por período) |

Tudo dentro de `(dashboard)` é protegido pelo `middleware.ts` — usuário não autenticado é redirecionado para `/login`.

### Layout `/turmas/[id]/layout.tsx`

Renderiza o header da turma (nome, badge de status, disciplina/nível/série/ano), o menu de tabs e o ícone de ações (`...`) que abre menu com **Concluir / Reativar / Excluir** turma. Faz `getTurma(id)` e retorna 404 se não pertencer ao professor.

### Detalhamento das telas

#### `/turmas` — Lista

- Cards em grid responsivo (1 / 2 / 3 colunas)
- Cada card: nome, badge de status (Ativa = verde / Concluída = cinza), disciplina, nível · série · ano
- Click no card → `/turmas/[id]/alunos`
- Botão `Nova turma` no canto superior direito → modal
- Empty state: card centralizado convidando a criar a primeira turma

Modal `NovaTurmaButton`: nome, nível (select), série, ano, disciplina. Validação Zod. Toast em sucesso/erro.

#### `/turmas/[id]/alunos` — Tab Alunos

- Tabela: Nome, Matrícula (ou "—"), Ações
- Botão `Adicionar aluno` no topo
- Linha "..." abre dropdown com **Editar** (modal) e **Remover** (alert dialog)
- Empty state quando a turma não tem alunos

#### `/turmas/[id]/periodos` — Tab Períodos

- Tabela: Ordem, Nome, Ações
- Ordenado por `ordem` ASC
- Botão `Adicionar período` no topo (default da `ordem` = max+1 dos existentes)
- Mesma UX de edição/remoção via dropdown
- Empty state instrui a criar bimestres/trimestres antes de adicionar atividades

#### `/turmas/[id]/atividades` — Tab Atividades

- **Agrupado por período** (cada seção mostra o nome do período + suas atividades)
- Cada período tem seu próprio botão `Nova atividade` (já pré-seleciona o período)
- Cada atividade: nome + valor máximo + ações (editar / remover)
- Edição permite **mover** atividade entre períodos da mesma turma (não permite cross-turma — bloqueado na action)
- Empty state da página: se não há períodos, mostra "Crie um período primeiro" com link para a tab Períodos
- Empty state por período: se o período não tem atividades, card com "Nenhuma atividade neste período ainda"

---

## 5. Server actions (API)

Todas em `actions/<entidade>.ts`, todas escopadas por `professorId` através de `getProfessorIdOrThrow()`.

### `actions/turmas.ts`

| Função                              | Retorno         | O que faz                                      |
|-------------------------------------|-----------------|------------------------------------------------|
| `listTurmas()`                      | `Turma[]`       | lista todas (ATIVA primeiro, depois CONCLUIDA) |
| `getTurma(id)`                      | `Turma \| null` | busca por id (escopo por tenant)               |
| `createTurma(input)`                | `Turma`         | cria com `status=ATIVA`                        |
| `updateTurma(id, input)`            | `void`          | atualização parcial dos campos                 |
| `archiveTurma(id)`                  | `void`          | seta `status=CONCLUIDA`                        |
| `reactivateTurma(id)`               | `void`          | seta `status=ATIVA`                            |
| `removeTurma(id)`                   | `void`          | hard delete (cascade leva tudo abaixo)         |

### `actions/alunos.ts`

| Função                              | Retorno     |
|-------------------------------------|-------------|
| `listAlunosByTurma(turmaId)`        | `Aluno[]`   |
| `createAluno(turmaId, input)`       | `Aluno`     |
| `updateAluno(id, input)`            | `void`      |
| `removeAluno(id)`                   | `void`      |

> Validações: `nome` obrigatório; `matricula` opcional, vira `null` se vazio.

### `actions/periodos.ts`

| Função                              | Retorno     |
|-------------------------------------|-------------|
| `listPeriodosByTurma(turmaId)`      | `Periodo[]` (ordenado por `ordem`) |
| `createPeriodo(turmaId, input)`     | `Periodo`   |
| `updatePeriodo(id, input)`          | `void`      |
| `removePeriodo(id)`                 | `void`      |

### `actions/atividades.ts`

| Função                                     | Retorno                                      |
|--------------------------------------------|----------------------------------------------|
| `listPeriodosComAtividades(turmaId)`       | `Periodo[]` com `atividades` aninhadas       |
| `createAtividade(input)`                   | `Atividade` (input inclui `periodoId`)       |
| `updateAtividade(id, input)`               | `void` (permite mover entre períodos da mesma turma) |
| `removeAtividade(id)`                      | `void`                                       |

> Bloqueio: `updateAtividade` rejeita se o `periodoId` novo pertencer a uma turma diferente.

---

## 6. Fluxo de uso do professor

1. **Cria conta** em `/signup` → auto-login → cai em `/turmas`
2. **Cria turma** com nome, nível, série, disciplina, ano
3. **Entra na turma** (clica no card)
4. **Tab Alunos** → adiciona os alunos um por um (CSV no futuro)
5. **Tab Períodos** → cria os bimestres/trimestres do ano (1, 2, 3, 4)
6. **Tab Atividades** → para cada período, cria as avaliações (provas, trabalhos)
7. _(futuro)_ Lançamento de notas: grid alunos × atividades
8. _(futuro)_ Visualização de médias e boletim

---

## 7. Pendências e próximos passos

### Operacional (não implementado ainda)

- **Lançamento de notas** — grid editável aluno × atividade dentro de um período
- **Cálculo de média** — `AVG(nota)` por aluno por período (regra simples)
- **Boletim do aluno** — visão consolidada com todas as notas e médias
- **Exportação** (PDF, planilha) — depois do boletim

### Polish e UX

- **Importação CSV** de alunos (cadastro em massa)
- **Breadcrumbs reais** (atualmente só link "← Turmas")
- **Filtros e busca** na lista de turmas (quando passar de ~10)
- **Avatar real** do professor (upload de foto)
- **Validação de email** com link de confirmação (registrado em `contexto-inicial.md`)

### Modelagem (a decidir)

- **Aluno como pessoa global + Matrícula** separada — permite que o mesmo aluno apareça em várias turmas mantendo histórico
- **Faltas/frequência**
- **Recuperação** (atividade-específica? período? final de ano?)
- **Disciplinas múltiplas por turma** (caso fundamental I)
- **Pesos em atividades** quando trocarmos a regra de cálculo

---

## 8. Arquivos relacionados

- `prisma/schema.prisma` — schema source-of-truth
- `prisma/migrations/` — histórico de migrations
- `lib/prisma.ts` — singleton do Prisma Client
- `lib/session.ts` — helper de tenant
- `lib/auth.ts` — config do NextAuth
- `actions/` — todas as server actions
- `app/(dashboard)/turmas/` — páginas
- `components/{turmas,alunos,periodos,atividades}/` — componentes de UI por entidade
