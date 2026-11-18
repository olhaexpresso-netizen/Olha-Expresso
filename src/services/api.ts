import {
  BusinessSector,
  CatalogEventDefinition,
  CharacterAppearance,
  EventCatalogCategory,
  GameSave,
  GovernmentAdministrationState,
  JobMarketRole,
  LifeEvent,
  PoliticalOfficeTitle,
  UserPreferences,
  WorldAdvanceUnit,
  WorldTruthStatus,
} from '../types';

export interface SaveSummaryItem {
  id: string;
  schemaVersion?: number;
  createdAt: number;
  updatedAt: number;
  character: any;
  worldYear?: number;
  brazilPhaseLabel?: string;
}

export interface MarketCatalogResponse {
  year: number;
  jobs: JobMarketRole[];
  educationPrograms: {
    id: string;
    name: string;
    minYear: number;
    levelRequired: string;
    costCentavos: number;
    durationYears: number;
  }[];
  treatments: {
    id: string;
    name: string;
    minYear: number;
    costCentavos: number;
    healthBoost: number;
  }[];
  assetsMarket: {
    id: string;
    type: 'Imóvel' | 'Veículo' | 'Empresa' | 'Investimento';
    name: string;
    priceCentavos: number;
    monthlyIncomeCentavos: number;
    minYear: number;
    description: string;
  }[];
  offenses?: {
    id: string;
    title: string;
    category: string;
    severity: number;
    baseRewardCentavos: number;
    baseDetectionRiskPct: number;
    baseSentenceYears: number;
    description: string;
  }[];
  politicalOffices?: {
    office: PoliticalOfficeTitle;
    scope: 'Municipal' | 'Estadual' | 'Federal';
    minAge: number;
    minReputation: number;
    campaignCostCentavos: number;
    termYears: number;
    annualSalaryCentavos: number;
  }[];
  politicalParties?: { id: string; name: string; ideology: string }[];
  publicPrograms?: { id: string; name: string; costBudgetPct: number; approvalBoost: number }[];
  religions?: string[];
}

async function parseError(res: Response, fallback: string): Promise<Error> {
  const errBody = await res.json().catch(() => ({}));
  return new Error(errBody.error || fallback);
}

export async function fetchSaves(): Promise<SaveSummaryItem[]> {
  const res = await fetch('/api/saves');
  if (!res.ok) throw new Error('Falha ao carregar partidas');
  return res.json();
}

export async function createGame(data: {
  firstName: string;
  lastName: string;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  state: string;
  city: string;
  country: string;
  startingMoney: number;
  startYear?: number;
  appearance?: CharacterAppearance;
}): Promise<GameSave> {
  const res = await fetch('/api/saves', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao criar nova partida');
  return res.json();
}

export async function updateAppearance(id: string, appearance: CharacterAppearance): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/appearance`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appearance }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao salvar aparência');
  return res.json();
}

export async function updatePreferences(id: string, prefs: UserPreferences): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao salvar preferências');
  return res.json();
}

export async function loadGame(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}`);
  if (!res.ok) throw new Error('Partida não encontrada');
  return res.json();
}

export async function deleteGame(id: string): Promise<void> {
  const res = await fetch(`/api/saves/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Falha ao excluir partida');
}

export async function advanceYear(id: string): Promise<GameSave> {
  return advanceTime(id, 'year');
}

export async function advanceTime(
  id: string,
  unit: WorldAdvanceUnit,
  idempotencyKey?: string
): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/advance-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unit, idempotencyKey }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao avançar o tempo');
  return res.json();
}

export async function fetchMarketCatalog(id: string): Promise<MarketCatalogResponse> {
  const res = await fetch(`/api/saves/${id}/market`);
  if (!res.ok) throw new Error('Falha ao consultar mercado da época');
  return res.json();
}

export async function submitChoice(id: string, eventId: string, choiceId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/choice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, choiceId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao registrar escolha');
  return res.json();
}

export async function applyCareer(id: string, roleId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/career`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roleId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao aplicar para carreira');
  return res.json();
}

export async function promoteCareer(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/career/promote`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Não foi possível obter promoção');
  return res.json();
}

export async function resignCareer(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/career/resign`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Falha ao pedir demissão');
  return res.json();
}

export async function foundCompany(
  id: string,
  companyName: string,
  sector: BusinessSector
): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/career/found-company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName, sector }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao fundar empresa');
  return res.json();
}

export async function enrollEducation(id: string, educationName: string, programId?: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/education`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ educationName, programId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao realizar matrícula');
  return res.json();
}

export async function buyAsset(id: string, catalogId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ catalogId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao adquirir patrimônio');
  return res.json();
}

export async function sellAsset(id: string, assetId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/assets/${assetId}/sell`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Falha ao vender bem');
  return res.json();
}

export async function commitCrime(id: string, crimeTypeOrOffenseId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/crime`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offenseId: crimeTypeOrOffenseId, crimeType: crimeTypeOrOffenseId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao executar ação');
  return res.json();
}

export async function fileCourtAppeal(id: string, caseId: string): Promise<{ save: GameSave; message: string }> {
  const res = await fetch(`/api/saves/${id}/crime/appeal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao protocolar recurso');
  return res.json();
}

export async function retireCharacter(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/retire`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Não foi possível solicitar aposentadoria');
  return res.json();
}

export async function manageSavings(
  id: string,
  amountCentavos: number,
  action: 'deposit' | 'withdraw'
): Promise<{ save: GameSave; message: string }> {
  const res = await fetch(`/api/saves/${id}/banking/savings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountCentavos, action }),
  });
  if (!res.ok) throw await parseError(res, 'Falha na operação bancária');
  return res.json();
}

export async function takeBankLoan(
  id: string,
  principalCentavos: number,
  months: number,
  purpose: string
): Promise<{ save: GameSave; message: string }> {
  const res = await fetch(`/api/saves/${id}/banking/loan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ principalCentavos, months, purpose }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao contratar empréstimo');
  return res.json();
}

export async function settleLoan(id: string, loanId?: string): Promise<{ save: GameSave; message: string }> {
  const res = await fetch(`/api/saves/${id}/banking/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loanId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao quitar dívida');
  return res.json();
}

export async function toggleInsurance(id: string, type: 'health' | 'life'): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/insurance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao alterar seguro');
  return res.json();
}

export async function marryPartner(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/family/marry`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Não foi possível casar');
  return res.json();
}

export async function divorcePartner(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/family/divorce`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Não foi possível divorciar');
  return res.json();
}

export async function haveChild(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/family/child`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Não foi possível ter filho');
  return res.json();
}

export async function adoptChild(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/family/adopt`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Não foi possível adotar');
  return res.json();
}

export async function interactWithFamily(
  id: string,
  memberId: string,
  action: 'conversar' | 'elogiar' | 'ajudar' | 'discutir' = 'conversar'
): Promise<{ save: GameSave; note: string }> {
  const res = await fetch(`/api/saves/${id}/family/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, action }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao interagir com familiar');
  return res.json();
}

export async function reconcileWithFamily(id: string, memberId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/family/reconcile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao reconciliar');
  return res.json();
}

export async function continueAsHeir(id: string, heirId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/continue-heir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ heirId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao continuar com herdeiro');
  return res.json();
}

export async function receiveMedicalTreatment(id: string, treatmentId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/health/treat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ treatmentId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao realizar tratamento');
  return res.json();
}

export async function vaccinateCharacter(id: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/health/vaccinate`, { method: 'POST' });
  if (!res.ok) throw await parseError(res, 'Falha ao vacinar');
  return res.json();
}

export async function practiceMentalWellness(
  id: string,
  activity: 'therapy' | 'sport' | 'meditation'
): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/health/mental`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activity }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao registrar cuidado mental');
  return res.json();
}

export async function moveCity(id: string, cityId: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/city/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cityId }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao mudar de cidade');
  return res.json();
}

export async function participateInPolitics(
  id: string,
  action: 'vote' | 'debate' | 'volunteer'
): Promise<{ save: GameSave; message: string }> {
  const res = await fetch(`/api/saves/${id}/politics/participate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw await parseError(res, 'Falha na participação cívica');
  return res.json();
}

export async function runForPoliticalOffice(
  id: string,
  office: PoliticalOfficeTitle,
  partyName: string
): Promise<{ save: GameSave; elected: boolean; voteSharePct: number; summary: string }> {
  const res = await fetch(`/api/saves/${id}/politics/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ office, partyName }),
  });
  if (!res.ok) throw await parseError(res, 'Falha na candidatura eleitoral');
  return res.json();
}

export async function governPublicPolicy(
  id: string,
  payload: {
    taxRatePct?: number;
    budgets?: Partial<GovernmentAdministrationState['budgets']>;
    toggleProgramId?: string;
    runCorruptionAudit?: boolean;
  }
): Promise<{ save: GameSave; message: string }> {
  const res = await fetch(`/api/saves/${id}/politics/govern`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao atualizar política governamental');
  return res.json();
}

export async function conservationAction(
  id: string,
  donate: boolean
): Promise<{ save: GameSave; message: string }> {
  const res = await fetch(`/api/saves/${id}/civilization/conservation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ donate }),
  });
  if (!res.ok) throw await parseError(res, 'Falha na atividade de conservação');
  return res.json();
}

export async function updateCharacterReligion(id: string, religion: string): Promise<GameSave> {
  const res = await fetch(`/api/saves/${id}/religion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ religion }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao atualizar convicção religiosa');
  return res.json();
}

export async function fetchEventCatalog(params: {
  category?: EventCatalogCategory | 'Todas';
  search?: string;
  year?: number;
  truthStatus?: WorldTruthStatus;
  page?: number;
  pageSize?: number;
}): Promise<{
  items: CatalogEventDefinition[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categoryCounts: Record<EventCatalogCategory, number>;
}> {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.search) qs.set('search', params.search);
  if (params.year !== undefined) qs.set('year', String(params.year));
  if (params.truthStatus) qs.set('truthStatus', params.truthStatus);
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  const res = await fetch(`/api/catalog/events?${qs.toString()}`);
  if (!res.ok) throw await parseError(res, 'Falha ao consultar catálogo de eventos');
  return res.json();
}

export async function triggerCatalogEvent(
  id: string,
  category?: EventCatalogCategory
): Promise<{ save: GameSave; event: LifeEvent }> {
  const res = await fetch(`/api/saves/${id}/events/trigger-catalog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  });
  if (!res.ok) throw await parseError(res, 'Falha ao sortear acontecimento do catálogo');
  return res.json();
}
