/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BusinessSector,
  CharacterAppearance,
  EventCatalogCategory,
  GameSave,
  GovernmentAdministrationState,
  LifeEvent,
  PoliticalOfficeTitle,
  UserPreferences,
  WorldAdvanceUnit,
} from './types';
import {
  fetchSaves,
  createGame,
  loadGame,
  deleteGame,
  advanceTime,
  submitChoice,
  applyCareer,
  promoteCareer,
  resignCareer,
  foundCompany,
  enrollEducation,
  buyAsset,
  sellAsset,
  commitCrime,
  fileCourtAppeal,
  retireCharacter,
  manageSavings,
  takeBankLoan,
  settleLoan,
  toggleInsurance,
  updateAppearance,
  updatePreferences,
  marryPartner,
  divorcePartner,
  haveChild,
  adoptChild,
  interactWithFamily,
  reconcileWithFamily,
  continueAsHeir,
  receiveMedicalTreatment,
  vaccinateCharacter,
  practiceMentalWellness,
  moveCity,
  participateInPolitics,
  runForPoliticalOffice,
  governPublicPolicy,
  conservationAction,
  updateCharacterReligion,
  triggerCatalogEvent,
  SaveSummaryItem,
} from './services/api';

import { HomeScreen } from './components/HomeScreen';
import { CharacterCreation } from './components/CharacterCreation';
import { Header } from './components/Header';
import { EventModal } from './components/EventModal';
import { CharacterAvatar } from './components/CharacterAvatar';
import { CharacterGalleryShowcase } from './components/CharacterGalleryShowcase';

import { ProfileTab } from './components/tabs/ProfileTab';
import { FamilyTab } from './components/tabs/FamilyTab';
import { FamilyTreeTab } from './components/tabs/FamilyTreeTab';
import { EducationTab } from './components/tabs/EducationTab';
import { CareerTab } from './components/tabs/CareerTab';
import { FinancesTab } from './components/tabs/FinancesTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { WorldTab } from './components/tabs/WorldTab';
import { PoliticsTab } from './components/tabs/PoliticsTab';
import { JusticeTab } from './components/tabs/JusticeTab';
import { CatalogTab } from './components/tabs/CatalogTab';

import {
  User,
  Users,
  Briefcase,
  DollarSign,
  History,
  Play,
  AlertCircle,
  GraduationCap,
  TreePine,
  Globe,
  Crown,
  Landmark,
  Scale,
  BookOpen,
} from 'lucide-react';

type ActiveTab =
  | 'profile'
  | 'world'
  | 'family'
  | 'family-tree'
  | 'education'
  | 'career'
  | 'finances'
  | 'politics'
  | 'justice'
  | 'catalog'
  | 'history'
  | 'settings';

const TIME_STEP_OPTIONS: { unit: WorldAdvanceUnit; label: string }[] = [
  { unit: 'day', label: '+1 Dia' },
  { unit: 'week', label: '+1 Semana' },
  { unit: 'month', label: '+1 Mês' },
  { unit: '6months', label: '+6 Meses' },
  { unit: 'year', label: '+1 Ano' },
  { unit: '5years', label: '+5 Anos' },
  { unit: '10years', label: '+10 Anos' },
  { unit: '50years', label: '+50 Anos' },
  { unit: '100years', label: '+100 Anos' },
];

export default function App() {
  const [view, setView] = useState<'home' | 'creation' | 'saves' | 'gallery' | 'game'>('home');
  const [savesList, setSavesList] = useState<SaveSummaryItem[]>([]);
  const [currentGame, setCurrentGame] = useState<GameSave | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [advanceUnit, setAdvanceUnit] = useState<WorldAdvanceUnit>('year');
  const [currentEvent, setCurrentEvent] = useState<LifeEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [civicFeedback, setCivicFeedback] = useState<string | null>(null);
  const [bankingFeedback, setBankingFeedback] = useState<string | null>(null);
  const [justiceFeedback, setJusticeFeedback] = useState<string | null>(null);
  const [familyFeedback, setFamilyFeedback] = useState<string | null>(null);
  const [civilizationFeedback, setCivilizationFeedback] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadSavesList();
  }, []);

  const loadSavesList = async () => {
    try {
      const list = await fetchSaves();
      setSavesList(list);
    } catch (err) {
      console.error(err);
    }
  };

  const runAction = async (fn: () => Promise<GameSave>) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const updated = await fn();
      setCurrentGame(updated);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao executar ação.');
    } finally {
      setLoading(false);
    }
  };

  const runFeedbackAction = async (
    fn: () => Promise<{ save: GameSave; message?: string; note?: string; summary?: string }>,
    setFeedback: (msg: string | null) => void
  ) => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fn();
      setCurrentGame(res.save);
      const rawMsg: any = res.message || res.note || res.summary || null;
      const msg =
        typeof rawMsg === 'string'
          ? rawMsg
          : rawMsg && typeof rawMsg.effectSummary === 'string'
            ? rawMsg.effectSummary
            : null;
      if (msg) setFeedback(msg);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao executar ação.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = () => setView('creation');

  const handleCreateCharacter = async (data: {
    firstName: string;
    lastName: string;
    gender: 'Masculino' | 'Feminino' | 'Outro';
    state: string;
    city: string;
    country: string;
    startingMoney: number;
    startYear: number;
    appearance: CharacterAppearance;
  }) => {
    try {
      setLoading(true);
      const newSave = await createGame(data);
      setCurrentGame(newSave);
      setActiveTab('profile');
      if (newSave.events.length > 0 && (newSave.userPreferences?.autoOpenEvents ?? true)) {
        setCurrentEvent(newSave.events[newSave.events.length - 1]);
      }
      setView('game');
      await loadSavesList();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSave = async (id: string) => {
    try {
      setLoading(true);
      const save = await loadGame(id);
      setCurrentGame(save);
      setActiveTab('profile');
      setView('game');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSave = async (id: string) => {
    try {
      await deleteGame(id);
      setConfirmDeleteId(null);
      await loadSavesList();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleAdvanceTime = async (unitToRun: WorldAdvanceUnit = advanceUnit) => {
    if (!currentGame || loading) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      const prevCount = currentGame.events.length;
      const updated = await advanceTime(currentGame.id, unitToRun);
      setCurrentGame(updated);
      const autoOpen = updated.userPreferences?.autoOpenEvents ?? true;
      if (autoOpen && updated.events.length > prevCount) {
        const latest = updated.events[updated.events.length - 1];
        if (latest.choices && latest.choices.length > 0 && !latest.chosenOptionId) {
          setCurrentEvent(latest);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = async (choiceId: string) => {
    if (!currentGame || !currentEvent) return;
    try {
      setLoading(true);
      const updated = await submitChoice(currentGame.id, currentEvent.id, choiceId);
      setCurrentGame(updated);
      setCurrentEvent(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCivicAction = async (action: 'vote' | 'debate' | 'volunteer') => {
    if (!currentGame) return;
    await runFeedbackAction(() => participateInPolitics(currentGame.id, action), setCivicFeedback);
  };

  const handleTriggerCatalogEvent = async (category?: EventCatalogCategory) => {
    if (!currentGame) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await triggerCatalogEvent(currentGame.id, category);
      setCurrentGame(res.save);
      if (res.event) setCurrentEvent(res.event);
    } catch (err: any) {
      setErrorMessage(err.message || 'Nenhum evento elegível disponível neste momento.');
    } finally {
      setLoading(false);
    }
  };

  if (view === 'home') {
    return (
      <HomeScreen
        onStartNew={handleStartNew}
        onOpenSaves={() => setView('saves')}
        onOpenGallery={() => setView('gallery')}
        savedGamesCount={savesList.length}
      />
    );
  }

  if (view === 'gallery') {
    return <CharacterGalleryShowcase onBack={() => setView('home')} />;
  }

  if (view === 'creation') {
    return (
      <CharacterCreation
        onCharacterCreated={handleCreateCharacter}
        onCancel={() => setView('home')}
      />
    );
  }

  if (view === 'saves') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 max-w-2xl mx-auto flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-xl font-bold">Partidas Salvas</h2>
            <button
              onClick={() => setView('home')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-medium"
            >
              Voltar
            </button>
          </div>

          {savesList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Nenhuma partida salva encontrada. Comece uma nova vida!
            </div>
          ) : (
            <div className="space-y-3">
              {savesList.map((s) => (
                <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <CharacterAvatar character={s.character} size="sm" showAgeBadge={true} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate">
                        {s.character.firstName} {s.character.lastName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 tabular-nums truncate">
                        {s.character.currentAge} anos · {s.character.city}, {s.character.state}
                        {s.worldYear ? ` · Ano ${s.worldYear}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSelectSave(s.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition"
                    >
                      Continuar
                    </button>
                    {confirmDeleteId === s.id ? (
                      <>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDeleteSave(s.id)}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-semibold"
                        >
                          Confirmar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 px-3 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'game' && currentGame) {
    const char = currentGame.character;
    const livingHeirs = currentGame.family.filter(
      (f) =>
        f.alive &&
        (f.relation === 'Filho' ||
          f.relation === 'Filha' ||
          f.relation === 'Neto' ||
          f.relation === 'Neta' ||
          f.relation === 'Bisneto' ||
          f.relation === 'Bisneta')
    );

    const navTabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
      { id: 'profile', label: 'Perfil', icon: User },
      { id: 'family', label: 'Família', icon: Users },
      { id: 'family-tree', label: 'Linhagem', icon: TreePine },
      { id: 'education', label: 'Estudos', icon: GraduationCap },
      { id: 'career', label: 'Carreira', icon: Briefcase },
      { id: 'finances', label: 'Finanças', icon: DollarSign },
      { id: 'politics', label: 'Política', icon: Landmark },
      { id: 'justice', label: 'Justiça', icon: Scale },
      { id: 'world', label: 'Mundo', icon: Globe },
      { id: 'catalog', label: 'Eventos', icon: BookOpen },
      { id: 'history', label: 'Histórico', icon: History },
    ];

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <Header
          character={char}
          worldState={currentGame.worldState}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenHistory={() => setActiveTab('history')}
        />

        {/* Single-row workspace navigation */}
        <nav className="bg-slate-900/80 border-b border-slate-800" aria-label="Navegação entre sistemas">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
            {navTabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                    active ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-28">
          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-900 text-rose-200 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm" role="alert">
              <AlertCircle size={20} className="shrink-0" />
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="ml-auto text-xs underline">
                Fechar
              </button>
            </div>
          )}

          {char.status === 'Morto' && (
            <div className="bg-slate-900 border border-amber-600/50 rounded-2xl p-6 mb-6 space-y-4 shadow-xl">
              <div className="flex items-start gap-3">
                <Crown className="text-amber-400 shrink-0 mt-0.5" size={22} />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Legado de {char.firstName} {char.lastName}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">
                    {char.firstName} faleceu aos {char.currentAge} anos ({char.causeOfDeath || 'causas naturais'}). O mundo continua evoluindo.
                  </p>
                </div>
              </div>

              {livingHeirs.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Escolha um herdeiro para continuar a dinastia:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {livingHeirs.map((heir) => (
                      <button
                        key={heir.id}
                        disabled={loading}
                        onClick={() => runAction(() => continueAsHeir(currentGame.id, heir.id))}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition"
                      >
                        Jogar como {heir.name} ({heir.relation}, {heir.age} anos)
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Não há descendentes vivos registrados nesta linhagem.</span>
                  <button
                    onClick={() => setView('home')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Voltar ao Início
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              character={char}
              worldState={currentGame.worldState}
              onUpdateAppearance={(app) => runAction(() => updateAppearance(currentGame.id, app))}
              onPracticeMentalWellness={(act) => runAction(() => practiceMentalWellness(currentGame.id, act))}
              onUpdateReligion={(rel) => runAction(() => updateCharacterReligion(currentGame.id, rel))}
              onRetire={() => runAction(() => retireCharacter(currentGame.id))}
              onTriggerCatalogEvent={() => handleTriggerCatalogEvent()}
            />
          )}
          {activeTab === 'world' && currentGame.worldState && (
            <WorldTab
              world={currentGame.worldState}
              onCivicAction={handleCivicAction}
              onConservationAction={(donate) =>
                runFeedbackAction(
                  () => conservationAction(currentGame.id, donate),
                  setCivilizationFeedback
                )
              }
              civicFeedback={civicFeedback}
              civilizationFeedback={civilizationFeedback}
            />
          )}
          {activeTab === 'family' && (
            <FamilyTab
              character={char}
              family={currentGame.family}
              confirmRiskyActions={currentGame.userPreferences?.confirmRiskyActions ?? true}
              familyFeedback={familyFeedback}
              onMarry={() => runAction(() => marryPartner(currentGame.id))}
              onDivorce={() => runAction(() => divorcePartner(currentGame.id))}
              onHaveChild={() => runAction(() => haveChild(currentGame.id))}
              onAdoptChild={() => runAction(() => adoptChild(currentGame.id))}
              onInteractMember={(memberId, action) =>
                runFeedbackAction(
                  () => interactWithFamily(currentGame.id, memberId, action),
                  setFamilyFeedback
                )
              }
              onReconcileMember={(memberId) => runAction(() => reconcileWithFamily(currentGame.id, memberId))}
            />
          )}
          {activeTab === 'family-tree' && (
            <FamilyTreeTab
              character={char}
              family={currentGame.family}
              worldState={currentGame.worldState}
              generationsHistory={currentGame.worldState?.generationsHistory}
              onContinueAsHeir={(heirId) => runAction(() => continueAsHeir(currentGame.id, heirId))}
            />
          )}
          {activeTab === 'education' && (
            <EducationTab
              character={char}
              worldState={currentGame.worldState}
              onEnrollEducation={(name, progId) => runAction(() => enrollEducation(currentGame.id, name, progId))}
            />
          )}
          {activeTab === 'career' && (
            <CareerTab
              character={char}
              worldState={currentGame.worldState}
              onApplyCareer={(roleId) => runAction(() => applyCareer(currentGame.id, roleId))}
              onPromote={() => runAction(() => promoteCareer(currentGame.id))}
              onResign={() => runAction(() => resignCareer(currentGame.id))}
              onFoundCompany={(name, sector: BusinessSector) =>
                runAction(() => foundCompany(currentGame.id, name, sector))
              }
            />
          )}
          {activeTab === 'finances' && (
            <FinancesTab
              character={char}
              assets={currentGame.assets}
              worldState={currentGame.worldState}
              bankingFeedback={bankingFeedback}
              onBuyAsset={(catalogId) => runAction(() => buyAsset(currentGame.id, catalogId))}
              onSellAsset={(assetId) => runAction(() => sellAsset(currentGame.id, assetId))}
              onMoveCity={(cityId) => runAction(() => moveCity(currentGame.id, cityId))}
              onManageSavings={(amount, act) =>
                runFeedbackAction(() => manageSavings(currentGame.id, amount, act), setBankingFeedback)
              }
              onTakeLoan={(principal, months, purpose) =>
                runFeedbackAction(
                  () => takeBankLoan(currentGame.id, principal, months, purpose),
                  setBankingFeedback
                )
              }
              onSettleLoan={(loanId) =>
                runFeedbackAction(() => settleLoan(currentGame.id, loanId), setBankingFeedback)
              }
              onToggleInsurance={(type) => runAction(() => toggleInsurance(currentGame.id, type))}
              onTreatHealth={(treatmentId) => runAction(() => receiveMedicalTreatment(currentGame.id, treatmentId))}
              onVaccinate={() => runAction(() => vaccinateCharacter(currentGame.id))}
              onOpenJustice={() => setActiveTab('justice')}
            />
          )}
          {activeTab === 'politics' && currentGame.worldState && (
            <PoliticsTab
              character={char}
              worldState={currentGame.worldState}
              feedbackMessage={civicFeedback}
              onCivicAction={handleCivicAction}
              onRunForOffice={(office: PoliticalOfficeTitle, partyName: string) =>
                runFeedbackAction(
                  () => runForPoliticalOffice(currentGame.id, office, partyName),
                  setCivicFeedback
                )
              }
              onGovernPolicy={(payload: {
                taxRatePct?: number;
                budgets?: Partial<GovernmentAdministrationState['budgets']>;
                toggleProgramId?: string;
                runCorruptionAudit?: boolean;
              }) =>
                runFeedbackAction(() => governPublicPolicy(currentGame.id, payload), setCivicFeedback)
              }
            />
          )}
          {activeTab === 'justice' && currentGame.worldState && (
            <JusticeTab
              character={char}
              worldState={currentGame.worldState}
              feedbackMessage={justiceFeedback}
              onCommitOffense={(offenseId) =>
                runAction(async () => {
                  const updated = await commitCrime(currentGame.id, offenseId);
                  setJusticeFeedback('Ocorrência registrada e avaliada pelo sistema policial/judicial.');
                  return updated;
                })
              }
              onFileAppeal={(caseId) =>
                runFeedbackAction(() => fileCourtAppeal(currentGame.id, caseId), setJusticeFeedback)
              }
            />
          )}
          {activeTab === 'catalog' && (
            <CatalogTab
              currentYear={currentGame.worldState?.clock.year ?? char.birthYear + char.currentAge}
              onTriggerCatalogEvent={handleTriggerCatalogEvent}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab
              history={currentGame.history}
              compact={currentGame.userPreferences?.compactTimeline ?? false}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              preferences={currentGame.userPreferences}
              onUpdatePreferences={(prefs: UserPreferences) =>
                runAction(() => updatePreferences(currentGame.id, prefs))
              }
              onReturnHome={() => {
                setView('home');
                loadSavesList();
              }}
              onDeleteGame={() => {
                handleDeleteSave(currentGame.id);
                setView('home');
                loadSavesList();
              }}
            />
          )}
        </main>

        {/* Compact Time Simulation Control Bar (stays <=15% viewport height on mobile) */}
        <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400 tabular-nums hidden sm:block">
              Ano <strong className="text-white">{currentGame.worldState?.clock.year ?? char.birthYear + char.currentAge}</strong> · Idade <strong className="text-white">{char.currentAge} anos</strong> · Estado <strong className={char.status === 'Preso' ? 'text-amber-400' : 'text-emerald-400'}>{char.status}</strong>
            </div>

            <div className="flex items-center gap-2 ml-auto shrink-0">
              <select
                aria-label="Intervalo de avanço temporal"
                value={advanceUnit}
                onChange={(e) => setAdvanceUnit(e.target.value as WorldAdvanceUnit)}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {TIME_STEP_OPTIONS.map((opt) => (
                  <option key={opt.unit} value={opt.unit}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                disabled={loading || char.status === 'Morto' || currentEvent !== null}
                onClick={() => handleAdvanceTime(advanceUnit)}
                className={`px-5 py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shrink-0 whitespace-nowrap ${
                  char.status !== 'Morto' && !currentEvent
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 border border-emerald-400/40'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Play size={14} fill="currentColor" />{' '}
                {loading ? 'Avançando...' : TIME_STEP_OPTIONS.find((o) => o.unit === advanceUnit)?.label || 'Avançar'}
              </button>
            </div>
          </div>
        </footer>

        {currentEvent && (
          <EventModal event={currentEvent} character={char} onSelectChoice={handleSelectChoice} />
        )}
      </div>
    );
  }

  return null;
}

