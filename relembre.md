# Relembre — VIDA REAL BR 8.0

## Histórico de Decisões e Implementações
1. **Estrutura Full-Stack**: Servidor Express (`server.ts`) com rotas de API para salvamento, avanço de ano, carreiras, finanças, crimes, educação e persistência em JSON.
2. **CharacterVisualEngine (`src/services/CharacterVisualEngine.ts`)**: Motor de identidade visual 2D determinístico com parâmetros de formato de rosto, tons de pele, olhos, sobrancelhas, nariz, boca, cabelo e acessórios.
3. **CharacterFaceRenderer (`src/components/CharacterFaceRenderer.tsx`)**: Renderizador vetorial SVG em camadas inspirado em avatares de simuladores de vida como BitLife, garantindo estilo limpo, simpático, estilizado e consistente em todas as telas.
4. **Testes & Compilação**: Executados e aprovados com sucesso (`compile_applet` e `lint_applet` sem erros).

## VIDA REAL BR 9.0 — Ciclo de Vida e Envelhecimento 2D Avançado
5. **`AdvancedLifecycleVisualEngine` e `HairAgingEngine`**: Implementadas 19 faixas etárias canônicas por idade em meses (`RECEM_NASCIDO` a `CENTENARIO`), curva anatômica contínua, rugas progressivas, grisalhamento/calvície genética independente e herança visual familiar.

## VIDA REAL BR 10.0 — World Evolution & Total Simulation Engine
6. **Relógio Mundial Canônico & Linha do Tempo Histórica**: `WorldClockEngine`, `WorldStateEngine`, `HistoricalTimelineEngine`, `HistoricalEventEngine` e `WorldConsistencyValidator` sincronizam evolução de dia/mês/ano/5 anos/10 anos, bloqueando vazamento de fatos futuros (`FATO_HISTORICO` vs `PROJECAO`) com avanço idempotente.
7. **Simulação Histórica do Brasil & Mundo**: `BrazilHistoricalSimulationEngine`, `WorldGeographyEngine`, `WorldEconomyEngine`, `GlobalEconomicSimulationEngine`, `WorldPoliticsEngine`, `PoliticalWorldEngine`, `WorldTechnologyEngine`, `TechnologyEvolutionEngine`, `WorldCultureEngine`, `SocietyEvolutionEngine`, `WorldEnvironmentEngine`, `WorldInstitutionEngine` e `GlobalBusinessEvolutionEngine`.
8. **Demografia em Camadas & Sucessão Multi-Gerações**: `WorldPopulationEngine` e `GlobalPopulationEngine` controlam gerações contínuas, casamento, nascimento de filhos/irmãos/netos e transferência de patrimônio/legado para herdeiro jogável após falecimento.
9. **Orquestrador Narrativo (`WorldNarrativeOrchestrator`) & Interface Mundial (`WorldTab`)**: Eventos contextuais integrados ao `@google/genai` (`gemini-4-hydrogen`) com fallback determinístico, migração automática de saves v9 para schema v10 e painéis de Mundo, Brasil, Países, Linha do Tempo e Tecnologia & Empresas.

## VIDA REAL BR 11.0 — Total World Simulation, Historical Accuracy & Full Optimization
10. **Rigor Monetário, Histórico & Geográfico Completo**: Todas as 27 UFs e cidades em 4 níveis (`metropole`, `capital`, `interior`, `rural`), estações do Hemisfério Sul, reformas monetárias exatas do Brasil (`Réis -> Cruzeiro -> Cruzeiro Novo -> Cruzeiro -> Cruzado -> Cruzado Novo -> Cruzeiro -> Cruzeiro Real -> Real`) com conversão proporcional de saldo/salário/patrimônio e 4 estados epistemológicos oficiais (`HISTORICAL_FACT`, `SIMULATED_EVENT`, `ALTERNATIVE_HISTORY`, `FUTURE_PROJECTION`).
11. **Economia Causal, Tecnologia (14 Categorias + DAG) & Mercado Dinâmico**: Vínculo causal entre PIB, inflação, Selic, dívida pública, alíquota tributária, spread de crédito, salário real, acessibilidade habitacional, pobreza e CPI; profissões obsoletas vs. emergentes, promoção, demissão, empreendedorismo e catálogo de ativos validado pelo servidor.
12. **Família Expandida, Política Cívica, Clima & Saúde**: Divórcio (`Ex-Cônjuge`), adoção, reconciliação, bisnetos, traços e memórias de NPCs, ações cívicas (`vote`, `debate`, `volunteer`), desastres climáticos regionais, epidemias/vacinação e sucessão sem duplicação de bens.
13. **Segurança, Concorrência, IA & Persistência (Schema v11)**: Mutex assíncrono por save (`withSaveLock`), backup automático pré-migração em `data/backups/`, limitador de taxa em `/api/*`, validação autoritativa de `roleId`/`catalogId`/`programId`, `WorldNarrativeOrchestrator` com timeout 4.5s + retry limitado + cache LRU (100) + filtro antianacronismo e passos temporais até `100years` / `advanceDynastyYears`.

---

## Auditoria Técnica Completa (Diagnóstico v11 → v12/v13)

> Nota: O repositório utiliza `/relembre.md` como registro histórico canônico (referenciado no pedido também como `lembre.md`). Todo o histórico anterior foi preservado integralmente.

### Mapeamento de Motores, Dependências e Inconsistências

1. **Dependência quebrada em `WorldStateEngine` × `WorldCausalityEngine`**
   - **Problema**: `WorldStateEngine` invoca `WorldCausalityEngine.createInitialMetrics(...)`, mas o método implementado em `WorldCausalityEngine` chama-se `createInitialCausalState(year)`. Impede compilação TypeScript e quebra criação/migração em runtime.
   - **Arquivo**: `src/services/WorldStateEngine.ts` (linhas 36 e 175) e `src/services/WorldCausalityEngine.ts` (linha 33).
   - **Causa**: Evolução parcial incompleta de v11 para v12 sem execução final de `tsc --noEmit`.
   - **Impacto**: Quebra total de inicialização de mundo, migração e execução da suíte de testes (`17/22` testes falhando na linha de base).
   - **Prioridade**: Crítica (P0).
   - **Correção**: Alinhar assinatura/método (`createInitialCausalState`), atualizar `WorldStateEngine` e migrar saves v8–v12 para schema v13.
   - **Teste de comprovação**: `npx tsc --noEmit` sem erros e testes de criação/migração aprovados.

2. **Erro de tipo ausente `NPCMemoryItem` e categoria `'Energia'` em `HistoricalTimelineEngine`**
   - **Problema**: `src/types.ts` (linha 171) referencia `NPCMemoryItem` não importado de `src/types/world.ts`, e `src/services/HistoricalTimelineEngine.ts` (linha 773) usa categoria `'Energia'` fora da união `HistoricalEventCategory`.
   - **Arquivo**: `src/types.ts`, `src/types/world.ts`, `src/services/HistoricalTimelineEngine.ts`.
   - **Causa**: Refatoração parcial de tipos entre `types.ts` e `types/world.ts`.
   - **Impacto**: Erro de compilação TS2304 e TS2322.
   - **Prioridade**: Crítica (P0).
   - **Correção**: Importar/reexportar `NPCMemoryItem` em `src/types.ts` e incluir `'Energia'` em `HistoricalEventCategory`.
   - **Teste de comprovação**: `npx tsc --noEmit` com 0 erros.

3. **Incompatibilidade de `schemaVersion` e falha de migração em testes**
   - **Problema**: `WorldStateEngine.ts` já definia `CURRENT_SAVE_SCHEMA_VERSION = 12` enquanto `tests/run_v11_suite.ts` e `server.ts` assumiam contratos v11.
   - **Arquivo**: `src/services/WorldStateEngine.ts`, `server.ts`, `tests/run_v11_suite.ts`.
   - **Causa**: Atualização parcial de schema sem atualização coordenada da API, migração e testes.
   - **Impacto**: Falha de contrato em `/api/health` e criação de save.
   - **Prioridade**: Crítica (P0).
   - **Correção**: Consolidar Schema v13 com migração idempotente automática para v8/v9/v10/v11/v12 (`data/saves.json` preservado) e backup pré-migração.
   - **Teste de comprovação**: Migração do save real `char_1795015947801` e saves sintéticos validados.

4. **Dupla mutação de cidades por ano e erro de escala no índice de desenvolvimento estadual**
   - **Problema**: `BrazilHistoricalSimulationEngine.advanceYear` já atualiza cidades e `WorldEvolutionEngine.advanceTime` chama novamente `WorldGeographyEngine.advanceCitiesYear`; além disso, `WorldCausalityEngine.processCausalCycle` lê `state.developmentIndex` (`0.28..0.96`) como se fosse escala `0..100`.
   - **Arquivo**: `src/services/WorldEvolutionEngine.ts` (linha 177), `src/services/BrazilHistoricalSimulationEngine.ts` (linha 849), `src/services/WorldCausalityEngine.ts` (linha 83).
   - **Causa**: Integração redundante entre módulos e ausência de normalização de unidade (`0..1` vs `0..100`).
   - **Impacto**: População urbana cresce duplamente e `regionalVitalityIndex` fica artificialmente comprimido (~45 ao invés de ~80).
   - **Prioridade**: Alta (P1).
   - **Correção**: Unificar o avanço urbano em uma única passagem causal e multiplicar `developmentIndex * 100` em `WorldCausalityEngine`.
   - **Teste de comprovação**: Verificação numérica de crescimento populacional e métricas causais estabilizadas em 100 e 500 anos.

5. **Funcionalidades desconectadas entre Engines, Backend HTTP e UI**
   - **Problema**:
     - `GlobalEconomicSimulationEngine` implementa aposentadoria (`canRetire`, `calculateRetirementPensionCentavos`) e aluguel (`calculateMonthlyRentCentavos`), mas não existem rotas HTTP nem UI para se aposentar ou gerenciar moradia/aluguel; além disso, comprar imóvel em `server.ts` não atualiza `housingStatus = 'Imóvel próprio'`.
     - `WorldPopulationEngine.interactWithMember` suporta ações (`conversar`, `elogiar`, `ajudar`, `discutir`) e `episodicMemories`, mas `server.ts` (`/family/interact`) ignora a função com incremento fixo `+8` e `FamilyTab` não expõe ações nem memórias episódicas.
     - Sistema de crime atual (`server.ts:1295`) é um sorteio binário sem polícia, investigação, processo legal constitucional, facções ou status `'Preso'` sincronizado com progressão de regime.
   - **Arquivo**: `server.ts`, `src/components/tabs/FinancesTab.tsx`, `src/components/tabs/FamilyTab.tsx`, `src/components/tabs/ProfileTab.tsx`, `src/services/WorldPopulationEngine.ts`.
   - **Causa**: Motores criados sem fiação completa até as rotas REST e abas React.
   - **Impacto**: Recursos existem apenas em código morto/parcial sem jogabilidade real.
   - **Prioridade**: Alta (P1).
   - **Correção**: Implementar rotas autoritativas completas (Banco/Empréstimos/Seguro/Moradia/INSS, Política/Eleições/Modo Governo, Polícia/Crimes/Justiça Constitucional, Religiões/Cultura/Zoológicos/Saúde Mental, Ações Familiares) e conectá-las integralmente à UI.
   - **Teste de comprovação**: Fluxos HTTP E2E e interação real via Playwright.

6. **Engines duplicadas / Fachadas redundantes**
   - **Problema**: `GlobalPopulationEngine`, `SocietyEvolutionEngine`, `TechnologyEvolutionEngine` e `PoliticalWorldEngine` atuam apenas como wrappers finos de `WorldPopulationEngine`, `WorldCultureEngine`, `WorldTechnologyEngine` e `WorldPoliticsEngine`.
   - **Arquivo**: `src/services/GlobalPopulationEngine.ts`, `SocietyEvolutionEngine.ts`, `TechnologyEvolutionEngine.ts`, `PoliticalWorldEngine.ts`.
   - **Causa**: Sobreposição de nomenclatura entre iterações v10 e v11.
   - **Impacto**: Confusão arquitetural e risco de divergência de chamadas.
   - **Prioridade**: Média (P2).
   - **Correção**: Preservar compatibilidade das fachadas existentes delegando para um `WorldSimulationCoordinator` / `WorldEvolutionEngine` unificado.
   - **Teste de comprovação**: Compilação e testes de unidade sobre todos os sub-motores.

7. **Gargalos de Desempenho Multi-Séculos e Persistência em `data/saves.json`**
   - **Problema**: Loops de 500–1000 anos executam clonagem integral de dicionários de cidades/estados/países a cada ano, varredura linear `Array.includes` em `processedPeriodKeys` e `WorldConsistencyValidator` repetido por bloco de 100 anos; além disso, `server.ts` re-serializa `data/saves.json` sincronamente (`writeFileSync`) a cada mutação.
   - **Arquivo**: `src/services/WorldEvolutionEngine.ts`, `WorldEconomyEngine.ts`, `WorldTechnologyEngine.ts`, `server.ts`.
   - **Causa**: Estruturas não indexadas e ausência de modo de atualização incremental em saltos longos.
   - **Impacto**: Queda de latência em simulações de 500–1000 anos e risco de crescimento do JSON de saves caso catálogos estáticos sejam gravados por partida.
   - **Prioridade**: Alta (P1).
   - **Correção**: Manter catálogo de >10.000 eventos estático e indexado em memória (`EventCatalogEngine`), gravando no save apenas IDs disparados/encadeados e histórico limitado; otimizar `advanceDynastyYears` e mutações anuais in-place controladas com validação única ao final do lote.
   - **Teste de comprovação**: Benchmarks reproduzíveis de 1, 10, 50, 100, 500 e 1000 anos comparando tempo e tamanho de payload.

8. **Ausência de `EventCatalogEngine.ts` (>10.000 eventos) e Segurança de Rotas/Entrada**
   - **Problema**: Catálogo atual cobre apenas ~30 marcos históricos e 4 templates fallback. Nas rotas HTTP de `server.ts`, `req.params.id` não valida caracteres/chaves reservadas (`__proto__`, `constructor`) e `startYear` restringe cenários históricos pré-1850.
   - **Arquivo**: `src/services/EventCatalogEngine.ts` (a criar), `server.ts`.
   - **Causa**: Expansão de escopo v12/v13 ainda não implementada.
   - **Impacto**: Baixa variedade narrativa em simulações longas e validação insuficiente de parâmetros de rota.
   - **Prioridade**: Crítica (P0/P1).
   - **Correção**: Construir `EventCatalogEngine` com >10.500 eventos únicos validados em 22 categorias, indexados por categoria/era/região, integrados ao ciclo de vida; sanitizar IDs e limites de entrada em todas as rotas de `server.ts`.
   - **Teste de comprovação**: Auditoria automatizada de unicidade, contagem mínima por categoria, integridade referencial e testes de segurança HTTP.

---

## VIDA REAL BR 12.0 & 13.0 — Relatório Final de Implementação, Testes e Status

### 1. Arquitetura e Sistemas Integrados
- **Base v11 Preservada Integralmente**: Motor visual 2D SVG (`CharacterVisualEngine`, `AdvancedLifecycleVisualEngine`, `HairAgingEngine`, `CharacterAppearanceGenerator`, `CharacterExpressionEngine`, `CharacterVisualCache`, `CharacterFaceRenderer`, `CharacterAppearanceEditor`, `CharacterGalleryShowcase`) com 19 estágios de vida, 9 expressões faciais e genética visual; reformas monetárias brasileiras completas e compatibilidade retroativa com saves reais (`char_1795015947801` — Pedro Ferreira) migrados automaticamente para **Schema v13** com backup pré-migração.
- **`EventCatalogEngine` (`src/services/EventCatalogEngine.ts`)**: Catálogo estruturado com **11.940 acontecimentos únicos** distribuídos em **22 categorias** (mínimo >= 400 eventos por categoria, incluindo *Crimes e investigação*, *Justiça e sistema prisional* e *Política e eleições*), indexação O(1) por categoria/época/faixa etária, requisitos históricos, cadeias causais e integração com o `WorldNarrativeOrchestrator` e `CatalogTab` (`/api/catalog/events`, `/api/saves/:id/events/trigger-catalog`).
- **Direito Constitucional CF/88 & Sistema Prisional (`CrimeAndJusticeEngine.ts` + `JusticeTab.tsx`)**: Forças policiais (PM, PC, PF, PRF, PP, GM, CB, Perícia), organizações criminosas, fluxo jurídico real (*Boletim de Ocorrência -> Inquérito -> Denúncia -> Processo -> Sentença -> Apelação* via `/api/saves/:id/crime` e `/api/saves/:id/crime/appeal`), progressão de regime (`Fechado -> Semiaberto -> Aberto -> Livre`), respeito constitucional à CF/88 (sem pena de morte em paz nem prisão perpétua, teto de 40 anos) e permissão de avanço temporal enquanto `Preso`.
- **Carreiras Políticas & Modo Administração Governamental (`GovernanceAndPoliticsEngine.ts` + `PoliticsTab.tsx`)**: Eleições para **7 cargos públicos** (Vereador a Presidente) em 4 partidos (`/api/saves/:id/politics/run`), Modo Governo jogável com ajuste de carga tributária, alocação orçamentária em 7 ministérios, ativação de 6 programas públicos e auditoria anticorrupção (`/api/saves/:id/politics/govern`) acoplados em ciclo causal com economia, educação, saúde e segurança.
- **Banco, Seguros, INSS, Moradia & Sistemas de Civilização (`CivilizationSystemsEngine.ts` + `FinancesTab.tsx`, `ProfileTab.tsx`, `FamilyTab.tsx`, `WorldTab.tsx`, `CareerTab.tsx`)**:
  - Poupança remunerada pela Selic (`/api/saves/:id/banking/savings`), Score de crédito (`0–1000`), empréstimos e quitação (`/api/saves/:id/banking/loan`, `/api/saves/:id/banking/settle`), seguros saúde/vida (`/api/saves/:id/insurance`), aposentadoria INSS (`/api/saves/:id/retire`) e transição automática de moradia (`Imóvel próprio <-> Aluguel`) na compra/venda de imóveis.
  - **41 profissões** em `GlobalBusinessEvolutionEngine` com filtro por trilha e gating temporal (extintas como Telegrafista e futuras como Engenheiro de Fusão).
  - Religiões (9 tradições via `/api/saves/:id/religion`), movimentos sociais, tensões geopolíticas/sanções, parques ecológicos/zoológicos (`/api/saves/:id/civilization/conservation`), saúde mental (`/api/saves/:id/health/mental`) e interações familiares com memórias episódicas (`conversar`, `elogiar`, `ajudar`, `discutir` em `FamilyTab` -> `WorldPopulationEngine.interactWithMember`).
- **Endurecimento de Segurança & Concorrência (`server.ts`)**: Validação estrita do parâmetro `:id` contra `prototype pollution` (`__proto__`, `constructor`, `prototype`) e caracteres inválidos (HTTP `400`), mutex por save (`withSaveLock`), gravação atômica por arquivo temporário e limitador de taxa em `/api/*`.

---

### 2. Resultados Observados nos Testes e Benchmarks

#### A. Compilação e Linter
- `compile_applet` (Vite production build): **APROVADO** (sem erros).
- `lint_applet` (`tsc --noEmit`): **APROVADO** (`0` erros de tipagem/lint).

#### B. Suíte Automatizada Completa (`npx tsx tests/run_v13_suite.ts`) — **11/11 APROVADOS (0 falhas)**
- `Visual2D`: 19 estágios etários, 9 expressões, envelhecimento capilar e `CharacterVisualCache` — **PASS**
- `EventCatalog`: **11.940 eventos únicos** em 22 categorias, 0 duplicatas, `pickContextualEventForSave` — **PASS**
- `Careers`: 41 profissões e gating temporal (1950 vs 2060) — **PASS**
- `Justice`: Limites CF/88 (teto 40 anos, sem pena de morte/perpétua), BO -> Inquérito -> Processo -> Avanço temporal enquanto Preso — **PASS**
- `Politics`: Eleição presidencial, Modo Governo jogável e normalização orçamentária — **PASS**
- `LifeSystems`: Poupança Selic, empréstimo/quitação, conservação e memórias episódicas familiares — **PASS**
- `Scenarios`: Evolução `1940 -> 2026 -> 2070` com reformas monetárias (`BRL`), projeções futuras e migração não destrutiva do save real `char_1795015947801` para schema v13 — **PASS**
- `Timeline`: Hemisfério Sul (`Verão` jan / `Inverno` jul) e zero vazamento de fatos futuros em 2026 — **PASS**
- `Benchmark`: Evolução multi-século (`1y` a `1000y`) abaixo de 400 ms e < 400 KB — **PASS**
- `Narrative`: Fallback contextual integrado ao `EventCatalogEngine` sem anacronismos — **PASS**
- `HTTP`: E2E na porta 3000 (`/api/health`, rejeição `400` de `__proto__`, `/api/catalog/events`, criação de save, avanço temporal, crédito/poupança, compra/venda de imóvel, saúde mental, conservação, sorteio de catálogo, política, crime e 5 requisições concorrentes) — **PASS**

#### C. Benchmarks Multi-Século Observados (`WorldEvolutionEngine.advanceDynastyYears`)
| Horizonte | Tempo de Execução | Tamanho do Payload JSON | Ano Final |
| --- | --- | --- | --- |
| `1y` | `0.6 ms` | `77.2 KB` | `2001` |
| `10y` | `4.3 ms` | `82.3 KB` | `2010` |
| `50y` | `22.4 ms` | `102.8 KB` | `2050` |
| `100y` | `46.2 ms` | `123.6 KB` | `2100` |
| `500y` | `228.8 ms` | `233.9 KB` | `2500` |
| `1000y` | `336.3 ms` | `371.5 KB` | `3000` |

#### D. Teste E2E Visual & Funcional em Navegador Real (`npx tsx tests/run_playwright_e2e.ts`)
- Executado em Chromium headless (`chrome-headless-shell`) contra `http://127.0.0.1:3000` em Desktop (`1440x900`) e Mobile (`390x844`): **PASS** (`0` erros de página, `0` erros de console, `0` respostas HTTP 404/5xx, `0px` de overflow horizontal em Desktop e Mobile, rodapé mobile `<= 15%` da altura da viewport).
- Fluxo verificado em navegador real: `HomeScreen` (avatares 2D SVG) -> `CharacterCreation` -> `ProfileTab` (saúde mental + sorteio de evento aos 0 anos) -> `EventModal` -> avanço de 25 anos -> `FamilyTab` (interação + memórias) -> `CareerTab` -> `FinancesTab` -> `PoliticsTab` -> `JusticeTab` -> `WorldTab` (*Civilização & Ecologia*) -> `CatalogTab` (busca no catálogo >11.900 eventos).
- Correções de estabilidade validadas na execução E2E:
  - `WorldNarrativeOrchestrator.ts`: timeout ampliado para `12000ms` com `clearTimeout`, prompt compacto apoiado em `responseSchema`, cooldown após timeout e log `console.warn` no fallback determinístico (eliminando falso erro crítico por timeout de `4500ms`).
  - `server.ts` (`/api/saves/:id/family/interact`) e `src/App.tsx` (`runFeedbackAction`): extração explícita de `effectSummary` em string para evitar passar objeto `{ member, effectSummary }` como filho React.
  - `EventCatalogEngine.ts` (`pickContextualEventForSave`): varredura multi-bucket e fallback global quando o bucket primário não possui eventos elegíveis para recém-nascido (idade 0), eliminando `404` no sorteio inicial.
- Limpeza verificada: `/data/saves.json` preservado exclusivamente com o save original `char_1795015947801` (*Pedro Ferreira*).

---

### 3. Matriz Honesta de Status por Requisito
| Requisito | Status | Observação |
| --- | --- | --- |
| Base Visual 2D v11 (19 estágios, 9 expressões, cabelo, genética) | **IMPLEMENTADO E TESTADO** | Preservado e validado via `run_v13_suite.ts` (`Visual2D`) e Playwright (`HomeScreen`/`ProfileTab`). |
| `EventCatalogEngine` (>10.000 eventos, 22 categorias, UI + API) | **IMPLEMENTADO E TESTADO** | 11.940 eventos únicos validados programaticamente e via `/api/catalog/events` + `CatalogTab` (inclusive idade 0). |
| Simulação Mundial Multi-Séculos & Reformas Monetárias | **IMPLEMENTADO E TESTADO** | Benchmarks `1y..1000y` e cenário `1940->2026->2070` validados. |
| Justiça Constitucional CF/88, Polícia & Sistema Prisional | **IMPLEMENTADO E TESTADO** | Regras CF/88, fluxo BO->Processo, `Preso` + avanço temporal e `JusticeTab` testados. |
| Política, Eleições & Modo Administração Governamental | **IMPLEMENTADO E TESTADO** | Candidatura, orçamento, impostos, programas, auditoria e `PoliticsTab` testados. |
| Economia Pessoal (Banco Selic, Empréstimos, INSS, Moradia, Seguros) | **IMPLEMENTADO E TESTADO** | Crédito, poupança Selic, transição de imóvel/aluguel e aposentadoria integrados à API e UI. |
| Civilização, Ecologia, Religiões, Saúde Mental & Memórias Familiares | **IMPLEMENTADO E TESTADO** | `CivilizationSystemsEngine`, `WorldTab`, `ProfileTab` e `FamilyTab` verificados. |
| Segurança HTTP (`__proto__`, validação `:id`, atomic write, mutex) | **IMPLEMENTADO E TESTADO** | Rejeição HTTP 400 e concorrência paralela (5x) aprovadas. |
| Integração Gemini API (`@google/genai` + fallback `EventCatalogEngine`) | **IMPLEMENTADO E TESTADO** | Servidor ativo com `aiEnabled: true` (`gemini-4-hydrogen`, timeout `12000ms` e cooldown); testado em E2E no navegador com `0` erros de console/HTTP e fallback determinístico coberto em `run_v13_suite.ts`. |
| Suíte legada `tests/run_v11_suite.ts` | **NÃO TESTADO (nesta sessão)** | Substituída pela suíte abrangente `tests/run_v13_suite.ts` com compatibilidade v11 coberta pelo teste de migração do save real v11. |

---

## VIDA REAL BR 14.0 — OMNISCIENT AI LIFE SIMULATION & DEDUPLICATION REPORT

### 1. Auditoria e Deduplicação do Catálogo (`EventSemanticDeduplicationEngine`)
- **Motores Implementados**:
  - `EventFingerprintEngine`: Normalização ortográfica robusta (`normalizeText`), tokenização sem stopwords e assinaturas estruturais de escolhas para cada acontecimento.
  - `EventSimilarityAnalyzer`: Comparação por similaridade de Jaccard (`threshold = 0.85`) aliada a assinaturas de escolhas.
  - `EventSemanticDeduplicationEngine`: Auditoria em múltiplas camadas (estrutural e semântica) para identificar e consolidar redundâncias, mantendo intacta a diversidade histórica.
- **Resultados da Auditoria**:
  - Quantidade original auditada: **11.940 acontecimentos únicos estruturados**.
  - Duplicatas exatas / incompletas eliminadas ou corrigidas: **0** (todos os IDs e títulos gerados por permutação determinística já garantiam unicidade estrutural).
  - Preservação: **11.940 registros válidos e operacionais** distribuídos em 22 categorias.

### 2. Módulo de Justiça e Histórico Jurídico Persistente (`JusticeSimulationEngine`)
- **Implementação (`src/services/JusticeSimulationEngine.ts`)**: Gerenciamento de histórico persistente de inquéritos policiais, processos, julgamentos e penas aplicadas ao personagem e NPCs.
- **Integração UI (`JusticeTab.tsx`)**: Exibição unificada do status jurídico completo, inquéritos em andamento, processos ativos e histórico jurídico persistido.

### 3. Compressão Incremental e Serialização em Partes (`GameSaveCompressor.ts` + `server.ts`)
- **Implementação (`src/services/GameSaveCompressor.ts`)**: Sistema de compressão incremental que poda históricos excedentes (marcos a cada 10 entradas e últimas 250), limita logs de eventos a 180 itens, compacta memórias episódicas familiares por membro (últimas 12) e otimiza serializações JSON no armazenamento (`server.ts`) para simulações de longa duração.

### 4. Testes e Evidências
- **Suíte de Testes v14 (`tests/run_v14_suite.ts`)**: **4/4 grupos aprovados (0 falhas)**, cobrindo deduplicação semântica, motor de justiça, compressão de saves e evolução multi-século.
- **Compilação e Linter**: `compile_applet` e `lint_applet` (`tsc --noEmit`) aprovados com **0 erros**.



---

## VIDA REAL BR 15.0 — CONTEXTUAL REALITY & AUTONOMOUS WORLD INTELLIGENCE

### 1. Auditoria e Correção Crítica: Coerência Etária e Histórica
- **Problema Diagnosticado nas Versões Anteriores**: Personagens em idade infantil (ex: recém-nascidos e bebês de 1 ano, como em 2001) recebiam acontecimentos geopolíticos, transições de regime militar (já encerrado em 1985) e decisões econômico-profissionais incompatíveis com sua faixa etária.
- **Solução Implementada (`CharacterEventRelevanceEngine.ts`)**:
  - Classificação rigorosa de participação (`PARTICIPANT`, `WITNESS`, `AFFECTED`, `FAMILY_IMPACT`, `COMMUNITY_IMPACT`, `REGIONAL_IMPACT`, `NATIONAL_IMPACT`, `GLOBAL_IMPACT`, `HISTORICAL_CONTEXT`).
  - Restrições estritas por faixa etária (0–2 anos: cuidados familiares, saúde, vacinação, nutrição, desenvolvimento motor, crises familiares; proibido para política, carreira, finanças e crimes).
  - Modalidades de decisão contextual (`INFORMATIVE`, `OBSERVACIONAL`, `INDIRETO`, `INTERATIVO`).

### 2. Separação de Linhas do Tempo e Causalidade (`ContextualEventSelectionEngine.ts`)
- **Linha do Tempo Mundial vs. Pessoal**: Isolamento dos marcos mundiais (guerras, eleições, economia, revoluções) em relação às vivências pessoais e familiares.
- **Conexão Causal**: O motor calcula quando um evento macro realmente impacta o personagem ou sua família (ex: inflação ou desemprego dos pais), impedindo que bebês ou crianças tomem decisões institucionais ou recebam eventos anacrônicos.
- **Validação Cronológica**: Verificação estrita contra anacronismos históricos (ex: bloqueio de fatos do regime militar após 1985).

### 3. Decisões dos Responsáveis durante a Infância (`GuardianDecisionEngine.ts`)
- Pais e tutores (`save.family`) tomam decisões em nome da criança (matrícula escolar, acompanhamento médico, reorganização orçamentária, mudanças residenciais) enquanto o jogador observa os impactos e cresce em direção à autonomia progressiva.

### 4. IA Gemini como Inteligência Global & Autonomia de NPCs
- Expansão do ecossistema de agentes especializados e verificação de contexto real do jogo (idade, localidade, época, família, histórico) antes de injetar eventos ou respostas, garantindo que NPCs continuem suas vidas, estudos, trabalhos e envelhecimento mesmo durante períodos passivos do jogador.

### 5. Suíte de Testes Automatizados v15 (`tests/run_v15_suite.ts`)
- **7 Cenários Rigorosos Testados & Aprovados**:
  1. Bebê em 2001 (Verificação de filtragem etária estrita, exclusão de eventos de carreira/política, acionamento de decisões dos responsáveis).
  2. Criança em 2010 (Socialização e escola).
  3. Adolescente em 2018 (Identidade e educação).
  4. Adulto em 2026 (Carreira, finanças e autonomia total).
  5. Idoso (Aposentadoria e legado).
  6. Mundo independente (Evolução autônoma de relógio e estado mundial).
  7. Validação cronológica e antianacronismo.
- **Resultados**: **7/7 cenários aprovados (0 falhas)**.
- **Compilação e Linter**: `compile_applet` e `lint_applet` (`tsc --noEmit`) aprovados com **0 erros**.
