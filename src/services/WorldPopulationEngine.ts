import { Character, FamilyMember, GameSave } from '../types';
import { NotableNPCRecord, WorldPopulationState, WorldState } from '../types/world';
import { CharacterAppearanceGenerator } from './CharacterAppearanceGenerator';

const FIRST_NAMES_M = ['Lucas', 'Gabriel', 'Mateus', 'Rafael', 'Pedro', 'Bruno', 'Henrique', 'Caio', 'Arthur', 'Daniel', 'Leonardo', 'Tiago'];
const FIRST_NAMES_F = ['Mariana', 'Beatriz', 'Juliana', 'Camila', 'Larissa', 'Sofia', 'Fernanda', 'Helena', 'Amanda', 'Isabela', 'Clara', 'Patrícia'];
const OCCUPATIONS = ['Engenheiro(a)', 'Professor(a)', 'Comerciante', 'Médico(a)', 'Analista', 'Advogado(a)', 'Artesão/Autônomo', 'Enfermeiro(a)', 'Estudante'];
const PERSONALITY_TRAITS = ['Resiliente', 'Comunicativo', 'Curioso', 'Pragmático', 'Acolhedor', 'Ambicioso', 'Criativo', 'Cauteloso'];
const NPC_GOALS = [
  'Estabilidade familiar',
  'Crescimento profissional',
  'Formação acadêmica',
  'Empreender na cidade',
  'Viajar e expandir horizontes',
];

function seededIndex(seed: string, mod: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % Math.max(1, mod);
}

function buildNpcTraits(seed: string): { personality: string[]; goals: string[]; mood: string } {
  const t1 = PERSONALITY_TRAITS[seededIndex(`${seed}_t1`, PERSONALITY_TRAITS.length)];
  const t2 = PERSONALITY_TRAITS[seededIndex(`${seed}_t2`, PERSONALITY_TRAITS.length)];
  const goal = NPC_GOALS[seededIndex(`${seed}_g`, NPC_GOALS.length)];
  return {
    personality: t1 === t2 ? [t1] : [t1, t2],
    goals: [goal],
    mood: 'Sereno',
  };
}

export class WorldPopulationEngine {
  static createInitialPopulationState(worldCountries: Record<string, any>, brazilPop: number, year: number): WorldPopulationState {
    const trackedPop = Object.values(worldCountries).reduce((s, c: any) => s + (c.population || 0), 0);
    const globalTotal = Math.max(brazilPop * 30, Math.round(trackedPop * 1.95));
    const devScale = Math.min(1, Math.max(0.2, (year - 1880) / 145));

    return {
      worldPopulationTotal: globalTotal,
      worldBirthRatePer1000: Number((year < 1960 ? 34 : year < 2000 ? 23 : 16.8).toFixed(1)),
      worldDeathRatePer1000: Number((year < 1950 ? 19 : 7.8).toFixed(1)),
      globalLifeExpectancy: Math.round(38 + devScale * 36),
      globalUrbanizationRate: Math.round(18 + devScale * 40),
      medianAgeGlobal: Math.round(21 + devScale * 11),
      medianAgeBrazil: Math.round(19 + devScale * 16),
      netBrazilMigrationPerYear: year < 1950 ? 45000 : -35000,
      livingGenerationsCount: 3,
    };
  }

  static createInitialNotableNPCs(year: number, city: string): NotableNPCRecord[] {
    const sectors = ['Cultura', 'Tecnologia', 'Economia', 'Ciência', 'Esportes'];
    return sectors.map((sector, idx) => {
      const birthYear = year - 26 - idx * 5;
      const isF = idx % 2 === 1;
      const first = isF ? FIRST_NAMES_F[(year + idx) % FIRST_NAMES_F.length] : FIRST_NAMES_M[(year + idx) % FIRST_NAMES_M.length];
      return {
        id: `npc_notable_${idx}_${birthYear}`,
        name: `${first} Vasconcelos`,
        role: sector === 'Ciência' ? 'Pesquisador(a) Nacional' : sector === 'Economia' ? 'Empreendedor(a)' : `Referência em ${sector}`,
        countryId: 'BRA',
        city,
        birthYear,
        alive: true,
        fame: 68 + idx * 4,
        sector,
        summary: `Personalidade influente no setor de ${sector} no Brasil.`,
        personality: buildNpcTraits(`notable_${idx}_${birthYear}`).personality,
      };
    });
  }

  static advanceMacroPopulationYear(world: WorldState, year: number): void {
    let totalTracked = 0;
    for (const c of Object.values(world.countries)) {
      if (c.id === 'BRA') {
        c.population = world.brazil.population;
        c.urbanizationRate = world.brazil.urbanizationRate;
        c.lifeExpectancy = world.brazil.lifeExpectancy;
      } else {
        const netPer1000 = c.birthRatePer1000 - c.deathRatePer1000 + c.netMigrationPer1000;
        const deltaRate = netPer1000 / 1000;
        c.population = Math.max(100000, Math.round(c.population * (1 + deltaRate)));
        c.urbanizationRate = Math.min(98, Number((c.urbanizationRate + (c.urbanizationRate < 85 ? 0.25 : 0.05)).toFixed(1)));
        c.lifeExpectancy = Math.min(90, Number((c.lifeExpectancy + 0.1).toFixed(1)));
        c.birthRatePer1000 = Math.max(6.2, Number((c.birthRatePer1000 - (c.birthRatePer1000 > 12 ? 0.12 : 0.03)).toFixed(1)));
      }
      totalTracked += c.population;
    }

    const techLifeBonus = world.technology.unlockedTechIds.includes('tech_precision_medicine') ? 0.18 : 0.08;
    world.population.worldPopulationTotal = Math.round(totalTracked * 1.95);
    world.population.globalLifeExpectancy = Number(Math.min(91, world.population.globalLifeExpectancy + techLifeBonus).toFixed(1));
    world.population.medianAgeBrazil = Number(Math.min(49, world.population.medianAgeBrazil + (year > 1990 ? 0.25 : 0.08)).toFixed(1));
    world.population.globalUrbanizationRate = Number(Math.min(85, world.population.globalUrbanizationRate + 0.22).toFixed(1));

    world.notableNPCs = world.notableNPCs.map((npc) => {
      if (!npc.alive) return npc;
      const age = year - npc.birthYear;
      if (age > world.brazil.lifeExpectancy + 8 && seededIndex(`${world.seed}_${npc.id}_${year}`, 10) === 0) {
        return { ...npc, alive: false };
      }
      return npc;
    });
  }

  /**
   * Advances living family members by 1 year, handling natural family deaths, mourning impact,
   * and generational progression (siblings, grandchildren, great-grandchildren).
   */
  static advanceFamilyOneYear(save: GameSave, currentYear: number): string[] {
    const notes: string[] = [];
    const char = save.character;
    const lifeExp = save.worldState?.brazil.lifeExpectancy ?? 76;
    let bereavementCount = 0;

    save.family = save.family.map((member) => {
      if (!member.alive) return member;
      const nextAge = member.age + 1;
      const riskThreshold = Math.max(68, lifeExp);
      const roll = seededIndex(`${save.id}_${member.id}_${currentYear}`, 100);
      const deathChance = nextAge > 98 ? 45 : nextAge > riskThreshold + 8 ? 18 : nextAge > riskThreshold ? 6 : 0;

      if (deathChance > 0 && roll < deathChance) {
        bereavementCount += 1;
        notes.push(`${member.name} (${member.relation}) faleceu aos ${nextAge} anos.`);
        return {
          ...member,
          age: nextAge,
          ageMonths: nextAge * 12,
          alive: false,
          deathYear: currentYear,
          mood: 'Em Paz',
          causeOfDeath: nextAge >= 80 ? 'Causas naturais da idade avançada' : 'Complicações de saúde',
        };
      }

      const traits = member.personality?.length ? {} : buildNpcTraits(member.id);
      return {
        ...member,
        ...traits,
        age: nextAge,
        ageMonths: nextAge * 12,
        mood: bereavementCount > 0 ? 'De Luto' : member.relationship >= 70 ? 'Alegre' : 'Estável',
      };
    });

    if (bereavementCount > 0) {
      char.happiness = Math.max(5, char.happiness - Math.min(18, bereavementCount * 9));
    }

    // Sibling chance when parents alive
    const livingParents = save.family.filter((f) => (f.relation === 'Pai' || f.relation === 'Mãe') && f.alive);
    const siblings = save.family.filter((f) => f.relation === 'Irmão' || f.relation === 'Irmã');
    if (
      char.currentAge >= 2 &&
      char.currentAge <= 10 &&
      livingParents.length === 2 &&
      siblings.length === 0 &&
      seededIndex(`${save.id}_sib_${currentYear}`, 100) < 18
    ) {
      const isGirl = seededIndex(`${save.id}_sib_gender_${currentYear}`, 2) === 1;
      const siblingRelation = isGirl ? 'Irmã' : 'Irmão';
      const firstName = isGirl
        ? FIRST_NAMES_F[seededIndex(`${save.id}_${currentYear}`, FIRST_NAMES_F.length)]
        : FIRST_NAMES_M[seededIndex(`${save.id}_${currentYear}`, FIRST_NAMES_M.length)];
      const sibId = `fam_sib_${currentYear}`;
      const sibSeed = `${save.id}_${sibId}_${siblingRelation}`;
      const sibGender = isGirl ? 'Feminino' : 'Masculino';

      save.family.push({
        id: sibId,
        characterId: char.id,
        name: `${firstName} ${char.lastName}`,
        relation: siblingRelation,
        age: 0,
        ageMonths: 0,
        birthYear: currentYear,
        alive: true,
        relationship: 75,
        occupation: 'Bebê',
        city: char.city,
        generation: char.generation,
        gender: sibGender,
        ...buildNpcTraits(sibId),
        memories: [`Nasceu em ${currentYear} em ${char.city}`],
        appearanceSeed: sibSeed,
        appearance: CharacterAppearanceGenerator.inheritFromParents(
          sibId,
          sibSeed,
          sibGender,
          livingParents[0].appearance || char.appearance!,
          livingParents[1].appearance
        ),
      });
      notes.push(`Nasceu seu/sua ${siblingRelation.toLowerCase()}, ${firstName} ${char.lastName}!`);
    }

    // Grandchildren chance from living adult children (biological age check: >= 24)
    const adultChildren = save.family.filter(
      (f) => (f.relation === 'Filho' || f.relation === 'Filha' || f.relation === 'Enteado' || f.relation === 'Enteada') &&
        f.alive &&
        f.age >= 24 &&
        f.age <= 42
    );
    const existingGrandchildren = save.family.filter((f) => f.relation === 'Neto' || f.relation === 'Neta');
    if (
      adultChildren.length > 0 &&
      existingGrandchildren.length < 3 &&
      seededIndex(`${save.id}_grandchild_${currentYear}`, 100) < 14
    ) {
      const parentChild = adultChildren[0];
      const isGirl = seededIndex(`${save.id}_gc_gender_${currentYear}`, 2) === 1;
      const relation = isGirl ? 'Neta' : 'Neto';
      const firstName = isGirl
        ? FIRST_NAMES_F[seededIndex(`${save.id}_gc_${currentYear}`, FIRST_NAMES_F.length)]
        : FIRST_NAMES_M[seededIndex(`${save.id}_gc_${currentYear}`, FIRST_NAMES_M.length)];
      const gcId = `fam_gc_${currentYear}_${existingGrandchildren.length + 1}`;
      const gcSeed = `${save.id}_${gcId}`;
      const gcGender = isGirl ? 'Feminino' : 'Masculino';
      save.family.push({
        id: gcId,
        characterId: char.id,
        name: `${firstName} ${char.lastName}`,
        relation,
        age: 0,
        ageMonths: 0,
        birthYear: currentYear,
        alive: true,
        relationship: 82,
        occupation: 'Bebê',
        city: char.city,
        generation: (char.generation || 1) + 2,
        gender: gcGender,
        ...buildNpcTraits(gcId),
        memories: [`Neto(a) nascido(a) em ${currentYear}`],
        appearanceSeed: gcSeed,
        appearance: CharacterAppearanceGenerator.inheritFromParents(
          gcId,
          gcSeed,
          gcGender,
          parentChild.appearance || char.appearance!
        ),
      });
      notes.push(`Você ganhou um(a) ${relation.toLowerCase()}: ${firstName} ${char.lastName}!`);
    }

    // Great-grandchildren (Bisneto / Bisneta) when living grandchildren reach 24..40
    const adultGrandchildren = save.family.filter(
      (f) => (f.relation === 'Neto' || f.relation === 'Neta') && f.alive && f.age >= 24 && f.age <= 40
    );
    const existingBis = save.family.filter((f) => f.relation === 'Bisneto' || f.relation === 'Bisneta');
    if (
      adultGrandchildren.length > 0 &&
      existingBis.length < 2 &&
      seededIndex(`${save.id}_bisneto_${currentYear}`, 100) < 12
    ) {
      const parentGc = adultGrandchildren[0];
      const isGirl = seededIndex(`${save.id}_bis_g_${currentYear}`, 2) === 1;
      const relation = isGirl ? 'Bisneta' : 'Bisneto';
      const firstName = isGirl
        ? FIRST_NAMES_F[seededIndex(`${save.id}_bis_${currentYear}`, FIRST_NAMES_F.length)]
        : FIRST_NAMES_M[seededIndex(`${save.id}_bis_${currentYear}`, FIRST_NAMES_M.length)];
      const bisId = `fam_bis_${currentYear}_${existingBis.length + 1}`;
      const bisSeed = `${save.id}_${bisId}`;
      const bisGender = isGirl ? 'Feminino' : 'Masculino';
      save.family.push({
        id: bisId,
        characterId: char.id,
        name: `${firstName} ${char.lastName}`,
        relation,
        age: 0,
        ageMonths: 0,
        birthYear: currentYear,
        alive: true,
        relationship: 85,
        occupation: 'Bebê',
        city: char.city,
        generation: (char.generation || 1) + 3,
        gender: bisGender,
        ...buildNpcTraits(bisId),
        memories: [`Bisneto(a) nascido(a) em ${currentYear}`],
        appearanceSeed: bisSeed,
        appearance: CharacterAppearanceGenerator.inheritFromParents(
          bisId,
          bisSeed,
          bisGender,
          parentGc.appearance || char.appearance!
        ),
      });
      notes.push(`Você ganhou um(a) ${relation.toLowerCase()}: ${firstName} ${char.lastName}!`);
    }

    return notes;
  }

  static createSpouse(save: GameSave, currentYear: number): FamilyMember {
    const char = save.character;
    if (char.currentAge < 18) {
      throw new Error('Idade mínima para casamento é 18 anos.');
    }
    const isFemale = char.gender === 'Masculino';
    const gender: 'Masculino' | 'Feminino' = isFemale ? 'Feminino' : 'Masculino';
    const idx = seededIndex(`${save.id}_spouse_${currentYear}`, FIRST_NAMES_F.length);
    const first = isFemale ? FIRST_NAMES_F[idx] : FIRST_NAMES_M[idx];
    const lastNames = ['Oliveira', 'Santos', 'Pereira', 'Costa', 'Almeida', 'Rodrigues', 'Ferreira'];
    const last = lastNames[seededIndex(`${save.id}_sp_last_${currentYear}`, lastNames.length)];
    const spouseAge = Math.max(18, char.currentAge + (idx % 5) - 2);
    const id = `fam_spouse_${currentYear}`;
    const seed = `${save.id}_${id}_${first}`;
    const appearance = CharacterAppearanceGenerator.generateFromSeed(seed, {
      characterId: id,
      gender,
      ageYears: spouseAge,
    });
    return {
      id,
      characterId: char.id,
      name: `${first} ${last}`,
      relation: 'Cônjuge',
      age: spouseAge,
      ageMonths: spouseAge * 12,
      birthYear: currentYear - spouseAge,
      alive: true,
      relationship: 84,
      occupation: OCCUPATIONS[idx % OCCUPATIONS.length],
      city: char.city,
      generation: char.generation,
      gender,
      married: true,
      maritalYear: currentYear,
      ...buildNpcTraits(id),
      memories: [`Casou-se com ${char.firstName} em ${currentYear}`],
      appearanceSeed: seed,
      appearance,
    };
  }

  static createChild(save: GameSave, currentYear: number): FamilyMember {
    const char = save.character;
    if (char.currentAge < 16) {
      throw new Error('Personagem precisa ter ao menos 16 anos para ter filhos.');
    }
    if (char.gender === 'Feminino' && char.currentAge > 54) {
      throw new Error('Plausibilidade biológica: acima de 54 anos considere adoção.');
    }
    const spouse = save.family.find((f) => f.relation === 'Cônjuge' && f.alive);
    const existingChildren = save.family.filter((f) => f.relation === 'Filho' || f.relation === 'Filha').length;
    const roll = seededIndex(`${save.id}_child_${currentYear}_${existingChildren}`, 100);
    const isGirl = roll % 2 === 1;
    const relation = isGirl ? 'Filha' : 'Filho';
    const gender: 'Masculino' | 'Feminino' = isGirl ? 'Feminino' : 'Masculino';
    const first = isGirl
      ? FIRST_NAMES_F[roll % FIRST_NAMES_F.length]
      : FIRST_NAMES_M[roll % FIRST_NAMES_M.length];
    const id = `fam_child_${currentYear}_${existingChildren + 1}`;
    const seed = `${save.id}_${id}_${first}`;

    return {
      id,
      characterId: char.id,
      name: `${first} ${char.lastName}`,
      relation,
      age: 0,
      ageMonths: 0,
      birthYear: currentYear,
      alive: true,
      relationship: 92,
      occupation: 'Bebê',
      city: char.city,
      generation: (char.generation || 1) + 1,
      gender,
      ...buildNpcTraits(id),
      memories: [`Nasceu em ${currentYear} em ${char.city}`],
      appearanceSeed: seed,
      appearance: CharacterAppearanceGenerator.inheritFromParents(
        id,
        seed,
        gender,
        char.appearance!,
        spouse?.appearance
      ),
    };
  }

  static adoptChild(save: GameSave, currentYear: number): FamilyMember {
    const char = save.character;
    if (char.currentAge < 21) {
      throw new Error('Idade mínima legal para adoção é 21 anos.');
    }
    const existingChildren = save.family.filter((f) => f.relation === 'Filho' || f.relation === 'Filha').length;
    const roll = seededIndex(`${save.id}_adopt_${currentYear}_${existingChildren}`, 100);
    const isGirl = roll % 2 === 0;
    const relation = isGirl ? 'Filha' : 'Filho';
    const gender: 'Masculino' | 'Feminino' = isGirl ? 'Feminino' : 'Masculino';
    const first = isGirl
      ? FIRST_NAMES_F[roll % FIRST_NAMES_F.length]
      : FIRST_NAMES_M[roll % FIRST_NAMES_M.length];
    const childAge = 1 + (roll % 6);
    const id = `fam_adopt_${currentYear}_${existingChildren + 1}`;
    const seed = `${save.id}_${id}_${first}`;
    const appearance = CharacterAppearanceGenerator.generateFromSeed(seed, {
      characterId: id,
      gender,
      ageYears: childAge,
    });

    const adopted: FamilyMember = {
      id,
      characterId: char.id,
      name: `${first} ${char.lastName}`,
      relation,
      age: childAge,
      ageMonths: childAge * 12,
      birthYear: currentYear - childAge,
      alive: true,
      relationship: 88,
      occupation: childAge >= 4 ? 'Estudante Infantil' : 'Criança',
      city: char.city,
      generation: (char.generation || 1) + 1,
      gender,
      isAdopted: true,
      ...buildNpcTraits(id),
      memories: [`Adotado(a) com carinho em ${currentYear}`],
      appearanceSeed: seed,
      appearance,
    };

    save.family.push(adopted);
    char.happiness = Math.min(100, char.happiness + 12);
    save.events.push({
      id: `evt_adopt_${currentYear}_${Date.now()}`,
      characterId: char.id,
      age: char.currentAge,
      year: currentYear,
      title: 'Adoção Concluída',
      description: `Você adotou ${adopted.name} (${adopted.age} anos) e expandiu sua família.`,
      category: 'Família',
      truthStatus: 'SIMULATED_EVENT',
    });
    return adopted;
  }

  static divorceSpouse(save: GameSave, currentYear: number): FamilyMember {
    const spouse = save.family.find((f) => f.relation === 'Cônjuge' && f.alive);
    if (!spouse) {
      throw new Error('Não há cônjuge ativo para divorciar.');
    }
    spouse.relation = 'Ex-Cônjuge';
    spouse.married = false;
    spouse.divorced = true;
    spouse.relationship = Math.max(15, spouse.relationship - 35);
    spouse.mood = 'Magoado';
    if (!spouse.memories) spouse.memories = [];
    spouse.memories.push(`Divórcio em ${currentYear}`);

    save.character.partnerId = undefined;
    save.character.happiness = Math.max(10, save.character.happiness - 10);
    save.events.push({
      id: `evt_divorce_${currentYear}_${Date.now()}`,
      characterId: save.character.id,
      age: save.character.currentAge,
      year: currentYear,
      title: 'Separação / Divórcio',
      description: `Você e ${spouse.name} decidiram encerrar o casamento em ${currentYear}.`,
      category: 'Romance',
      truthStatus: 'SIMULATED_EVENT',
    });
    return spouse;
  }

  static logEpisodicMemory(
    member: FamilyMember,
    year: number,
    summary: string,
    sentiment: 'positivo' | 'neutro' | 'negativo',
    impactLevel = 3
  ): void {
    if (!member.episodicMemories) member.episodicMemories = [];
    member.episodicMemories.unshift({
      id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      year,
      summary,
      sentiment,
      impactLevel: Math.max(1, Math.min(5, impactLevel)),
    });
    if (member.episodicMemories.length > 15) {
      member.episodicMemories = member.episodicMemories.slice(0, 15);
    }
  }

  static interactWithMember(
    save: GameSave,
    memberId: string,
    action: 'conversar' | 'elogiar' | 'ajudar' | 'discutir',
    currentYear: number
  ): { member: FamilyMember; effectSummary: string } {
    const member = save.family.find((f) => f.id === memberId && f.alive);
    if (!member) throw new Error('Familiar não encontrado ou falecido.');

    let relDelta = 0;
    let charHappDelta = 0;
    let effectSummary = '';
    let sentiment: 'positivo' | 'neutro' | 'negativo' = 'positivo';

    if (action === 'conversar') {
      relDelta = 5;
      charHappDelta = 3;
      effectSummary = `Conversa agradável com ${member.name}. A afinidade subiu +5.`;
      sentiment = 'positivo';
    } else if (action === 'elogiar') {
      relDelta = 8;
      charHappDelta = 4;
      effectSummary = `Você elogiou ${member.name}, que ficou radiante! Afinidade +8.`;
      sentiment = 'positivo';
    } else if (action === 'ajudar') {
      relDelta = 12;
      charHappDelta = 5;
      effectSummary = `Você ofereceu apoio prático a ${member.name}. Laço fortalecido (+12).`;
      sentiment = 'positivo';
    } else if (action === 'discutir') {
      relDelta = -14;
      charHappDelta = -6;
      effectSummary = `Divergência ríspida com ${member.name}. Clima tenso (-14).`;
      sentiment = 'negativo';
    }

    member.relationship = Math.max(0, Math.min(100, member.relationship + relDelta));
    save.character.happiness = Math.max(0, Math.min(100, save.character.happiness + charHappDelta));
    this.logEpisodicMemory(member, currentYear, effectSummary, sentiment, Math.abs(relDelta) > 10 ? 4 : 2);

    return { member, effectSummary };
  }

  static reconcileWithMember(save: GameSave, memberId: string, currentYear: number): FamilyMember {
    const member = save.family.find((f) => f.id === memberId && f.alive);
    if (!member) {
      throw new Error('Familiar não encontrado ou falecido.');
    }
    member.relationship = Math.min(100, member.relationship + 16);
    member.mood = 'Reconciliado';
    if (!member.memories) member.memories = [];
    member.memories.push(`Reconciliação familiar em ${currentYear}`);
    this.logEpisodicMemory(member, currentYear, `Reconciliação com ${save.character.firstName} em ${currentYear}`, 'positivo', 4);
    save.character.happiness = Math.min(100, save.character.happiness + 6);
    return member;
  }

  /**
   * Transitions control to a chosen living heir (child, grandchild, or great-grandchild) when the protagonist dies,
   * preserving world state, lineage history, and inheriting assets + wealth with zero duplication.
   */
  static transferLegacyToHeir(save: GameSave, heirId: string): GameSave {
    const heir = save.family.find((f) => f.id === heirId && f.alive);
    if (!heir) {
      throw new Error('Herdeiro selecionado inválido ou falecido.');
    }
    const oldChar = save.character;
    const currentYear = save.worldState?.clock.year ?? oldChar.birthYear + oldChar.currentAge;

    const totalAssetsVal = save.assets.reduce((acc, a) => acc + a.value, 0);
    const livingDirectHeirs = save.family.filter(
      (f) => f.alive && (f.relation === 'Filho' || f.relation === 'Filha')
    ).length;
    const shareFactor = livingDirectHeirs > 1 ? 1 / livingDirectHeirs : 1;
    const inheritedCash = Math.max(0, Math.round(oldChar.money * shareFactor));

    if (save.worldState) {
      save.worldState.generationsHistory.push({
        generation: oldChar.generation || 1,
        protagonistId: oldChar.id,
        protagonistName: `${oldChar.firstName} ${oldChar.lastName}`,
        birthYear: oldChar.birthYear,
        deathYear: currentYear,
        inheritedNetWorthCentavos: inheritedCash + totalAssetsVal,
        city: oldChar.city,
        occupation: oldChar.careerTitle,
        legacyTitle:
          inheritedCash + totalAssetsVal > 100000000
            ? 'Dinastia Próspera'
            : oldChar.careerTitle
              ? `Legado de ${oldChar.careerTitle}`
              : 'Legado Familiar',
      });
    }

    const parts = heir.name.split(' ');
    const nextFirst = parts[0] || 'Herdeiro';
    const nextLast = parts.slice(1).join(' ') || oldChar.lastName;
    const nextGen = (oldChar.generation || 1) + 1;
    const nextGender: Character['gender'] =
      heir.gender ||
      (heir.relation === 'Filho' || heir.relation === 'Neto' || heir.relation === 'Bisneto'
        ? 'Masculino'
        : 'Feminino');

    const newChar: Character = {
      id: `char_${heir.id}_${currentYear}`,
      userId: oldChar.userId,
      firstName: nextFirst,
      lastName: nextLast,
      gender: nextGender,
      avatarSeed: heir.appearanceSeed || `${heir.id}_${nextFirst}`,
      appearanceSeed: heir.appearanceSeed || `${heir.id}_${nextFirst}`,
      appearance: heir.appearance
        ? { ...heir.appearance, characterId: `char_${heir.id}_${currentYear}` }
        : CharacterAppearanceGenerator.generateFromSeed(`${heir.id}_${nextFirst}`, {
            characterId: `char_${heir.id}_${currentYear}`,
            gender: nextGender,
            ageYears: heir.age,
          }),
      country: oldChar.country,
      state: oldChar.state,
      city: heir.city || oldChar.city,
      birthYear: heir.birthYear ?? currentYear - heir.age,
      currentAge: heir.age,
      ageMonths: heir.ageMonths ?? heir.age * 12,
      money: inheritedCash + 500000,
      debtCentavos: 0,
      salary: heir.age >= 20 ? 3600000 : 0,
      health: 92,
      happiness: 65,
      intelligence: 60,
      looks: 65,
      fitness: 72,
      charisma: 60,
      discipline: 60,
      reputation: Math.min(90, Math.round(oldChar.reputation * 0.6 + 20)),
      careerSkill: heir.age >= 22 ? 30 : 0,
      emotionalStability: 70,
      status: 'Vivo',
      generation: nextGen,
      parentId: oldChar.id,
      educationLevel:
        heir.age >= 22 ? 'Universidade' : heir.age >= 18 ? 'Médio' : heir.age >= 14 ? 'Fundamental' : 'Nenhum',
      educationProgress: 0,
      careerTitle: heir.age >= 20 ? heir.occupation || 'Profissional Autônomo' : undefined,
      careerCompany: heir.age >= 20 ? 'Mercado Brasileiro' : undefined,
      careerExperienceYears: Math.max(0, heir.age - 20),
      criminalRecord: { arrests: 0, prisonYearsRemaining: 0, crimesCommitted: [] },
    };

    const remappedFamily: FamilyMember[] = [
      {
        id: `fam_deceased_parent_${oldChar.id}`,
        characterId: newChar.id,
        name: `${oldChar.firstName} ${oldChar.lastName}`,
        relation: oldChar.gender === 'Feminino' ? 'Mãe' : 'Pai',
        age: oldChar.currentAge,
        ageMonths: oldChar.currentAge * 12,
        birthYear: oldChar.birthYear,
        deathYear: currentYear,
        causeOfDeath: oldChar.causeOfDeath || 'Causas naturais',
        alive: false,
        relationship: 90,
        occupation: oldChar.careerTitle || 'Memória da Família',
        appearanceSeed: oldChar.appearanceSeed,
        appearance: oldChar.appearance,
      },
      ...save.family
        .filter((f) => f.id !== heir.id)
        .map((f): FamilyMember => {
          let nextRel = f.relation;
          if (f.relation === 'Filho' || f.relation === 'Enteado') nextRel = 'Irmão';
          else if (f.relation === 'Filha' || f.relation === 'Enteada') nextRel = 'Irmã';
          else if (f.relation === 'Neto') nextRel = 'Filho';
          else if (f.relation === 'Neta') nextRel = 'Filha';
          else if (f.relation === 'Bisneto') nextRel = 'Neto';
          else if (f.relation === 'Bisneta') nextRel = 'Neta';
          else if (f.relation === 'Irmão') nextRel = 'Tio';
          else if (f.relation === 'Irmã') nextRel = 'Tia';
          else if (f.relation === 'Pai' || f.relation === 'Mãe') nextRel = f.gender === 'Feminino' ? 'Avó' : 'Avô';
          return { ...f, characterId: newChar.id, relation: nextRel };
        }),
    ];

    save.character = newChar;
    save.family = remappedFamily;
    // Assets are reassigned cleanly to new protagonist with zero duplication
    save.assets = save.assets.map((a) => ({ ...a, characterId: newChar.id }));
    save.events.push({
      id: `evt_heir_${currentYear}_${Date.now()}`,
      characterId: newChar.id,
      age: newChar.currentAge,
      year: currentYear,
      title: `Nova Geração (${nextGen}ª Geração)`,
      description: `Você assumiu o legado da família como ${newChar.firstName} ${newChar.lastName} aos ${newChar.currentAge} anos em ${newChar.city}.`,
      category: 'Família',
      truthStatus: 'SIMULATED_EVENT',
    });
    save.history.push({
      age: newChar.currentAge,
      year: currentYear,
      summary: `Início da ${nextGen}ª Geração: assumiu o legado de ${oldChar.firstName} ${oldChar.lastName}.`,
    });

    return save;
  }
}
