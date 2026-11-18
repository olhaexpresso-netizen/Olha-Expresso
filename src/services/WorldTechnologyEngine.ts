import { TechnologyCategory, TechnologyDefinition, WorldTechnologyState, WorldTruthStatus } from '../types/world';

const REGIONS = ['Sudeste', 'Sul', 'Centro-Oeste', 'Nordeste', 'Norte'] as const;

const REGION_DIFFUSION_SPEED: Record<string, number> = {
  Sudeste: 1.15,
  Sul: 1.08,
  'Centro-Oeste': 0.96,
  Nordeste: 0.88,
  Norte: 0.82,
};

export const TECHNOLOGY_CATALOG: TechnologyDefinition[] = [
  {
    id: 'tech_mechanized_agro',
    name: 'Mecanização Agrícola e Tratores',
    category: 'Agricultura',
    inventionYear: 1910,
    mainstreamYear: 1955,
    dependencies: [],
    originRegion: 'América do Norte / Sudeste BR',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Tratores e mecanização elevam produtividade agrícola e liberam mão de obra rural para cidades.',
    lifeExpectancyBonus: 0.4,
    productivityBonus: 3,
    unlockedCareers: ['Operador de Máquinas Agrícolas', 'Engenheiro Agrônomo'],
  },
  {
    id: 'tech_telegraph_radio',
    name: 'Radiodifusão e Telecomunicação Analógica',
    category: 'Comunicação',
    inventionYear: 1901,
    mainstreamYear: 1930,
    dependencies: [],
    originRegion: 'Europa / Sudeste BR',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Redes de rádio e telefonia fixa interligam cidades brasileiras e o noticiário mundial.',
    lifeExpectancyBonus: 0.3,
    productivityBonus: 2,
    unlockedCareers: ['Radialista', 'Operador de Telégrafo', 'Jornalista de Rádio'],
  },
  {
    id: 'tech_penicillin_antibiotics',
    name: 'Antibióticos e Vacinação em Massa',
    category: 'Medicina',
    inventionYear: 1928,
    mainstreamYear: 1945,
    dependencies: [],
    originRegion: 'Europa / Brasil',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Penicilina e campanhas nacionais reduzem drasticamente mortalidade infantil e infecções.',
    lifeExpectancyBonus: 8.5,
    productivityBonus: 3,
    unlockedCareers: ['Pesquisador Biomédico', 'Enfermeiro Hospitalar'],
    unlockedTreatments: ['Antibioticoterapia Clínica', 'Imunização Preventiva'],
  },
  {
    id: 'tech_electronics_tv',
    name: 'Eletrônica de Consumo, Transistores e TV',
    category: 'Eletrônica',
    inventionYear: 1947,
    mainstreamYear: 1962,
    dependencies: ['tech_telegraph_radio'],
    originRegion: 'Estados Unidos / São Paulo & Rio',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Transistores e aparelhos televisores transformam a indústria eletrônica e o lazer doméstico.',
    lifeExpectancyBonus: 0,
    productivityBonus: 2,
    unlockedCareers: ['Técnico em Eletrônica', 'Produtor de Televisão'],
  },
  {
    id: 'tech_aviation_automotive',
    name: 'Indústria Automobilística e Aviação Comercial',
    category: 'Transporte',
    inventionYear: 1919,
    mainstreamYear: 1960,
    dependencies: [],
    originRegion: 'América do Norte / ABC Paulista',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Integração rodoviária e voos comerciais encurtam distâncias entre capitais.',
    lifeExpectancyBonus: 0.4,
    productivityBonus: 4,
    unlockedCareers: ['Engenheiro Automobilístico', 'Piloto Comercial', 'Mecânico Industrial'],
  },
  {
    id: 'tech_mainframes',
    name: 'Computadores Corporativos e Automação Bancária',
    category: 'Computação',
    inventionYear: 1951,
    mainstreamYear: 1975,
    dependencies: ['tech_electronics_tv'],
    originRegion: 'Estados Unidos / Brasil',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Grandes computadores transformam folhas de pagamento, bancos e engenharia.',
    lifeExpectancyBonus: 0,
    productivityBonus: 5,
    unlockedCareers: ['Analista de Sistemas Mainframe', 'Programador COBOL'],
    obsoletedCareers: ['Operador de Telégrafo'],
  },
  {
    id: 'tech_space_satellites',
    name: 'Satélites de Telecomunicações e Exploração Espacial',
    category: 'Exploração Espacial',
    inventionYear: 1957,
    mainstreamYear: 1978,
    dependencies: ['tech_electronics_tv', 'tech_aviation_automotive'],
    originRegion: 'EUA / URSS / Rede Global',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Satélites viabilizam transmissões intercontinentais, previsão climática e GPS futuro.',
    lifeExpectancyBonus: 0.2,
    productivityBonus: 3,
    unlockedCareers: ['Engenheiro Aeroespacial'],
  },
  {
    id: 'tech_industrial_automation',
    name: 'Linhas Industriais Automatizadas (CNC e CLPs)',
    category: 'Automação',
    inventionYear: 1968,
    mainstreamYear: 1986,
    dependencies: ['tech_mainframes'],
    originRegion: 'Alemanha / Japão / Sudeste BR',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Controladores lógicos elevam precisão fabril e transformam o chão de fábrica.',
    lifeExpectancyBonus: 0.1,
    productivityBonus: 6,
    unlockedCareers: ['Engenheiro de Automação Industrial'],
  },
  {
    id: 'tech_personal_computers',
    name: 'Computadores Pessoais e Planilhas Digitais',
    category: 'Computação',
    inventionYear: 1977,
    mainstreamYear: 1990,
    dependencies: ['tech_mainframes'],
    originRegion: 'Estados Unidos / Brasil',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Microcomputadores chegam a escritórios, escolas e residências.',
    lifeExpectancyBonus: 0,
    productivityBonus: 6,
    unlockedCareers: ['Técnico em Informática', 'Web Designer'],
    obsoletedCareers: ['Datilógrafo'],
  },
  {
    id: 'tech_internet',
    name: 'Internet Comercial e World Wide Web',
    category: 'Internet',
    inventionYear: 1991,
    mainstreamYear: 1998,
    dependencies: ['tech_personal_computers', 'tech_space_satellites'],
    originRegion: 'Suíça / EUA / Brasil (RNP)',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Navegação na web, e-mail e portais conectam negócios e educação globalmente.',
    lifeExpectancyBonus: 0.3,
    productivityBonus: 8,
    unlockedCareers: ['Desenvolvedor Web', 'Analista de E-commerce'],
  },
  {
    id: 'tech_industrial_robotics',
    name: 'Robótica Industrial de Precisão',
    category: 'Robótica',
    inventionYear: 1985,
    mainstreamYear: 2004,
    dependencies: ['tech_industrial_automation'],
    originRegion: 'Japão / Alemanha / Brasil',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Braços robóticos aceleram montagem automotiva, logística e manufatura avançada.',
    lifeExpectancyBonus: 0.1,
    productivityBonus: 6,
    unlockedCareers: ['Engenheiro Mecatrônico'],
  },
  {
    id: 'tech_biotech_genomics',
    name: 'Biotecnologia Agrícola e Genômica Inicial',
    category: 'Biotecnologia',
    inventionYear: 2000,
    mainstreamYear: 2012,
    dependencies: ['tech_penicillin_antibiotics', 'tech_mainframes'],
    originRegion: 'Consórcio Internacional / Embrapa BR',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Melhoramento genético agrícola, vacinas recombinantes e testes moleculares.',
    lifeExpectancyBonus: 1.5,
    productivityBonus: 5,
    unlockedCareers: ['Biotecnologista', 'Pesquisador Genômico'],
  },
  {
    id: 'tech_smartphones',
    name: 'Smartphones, 4G/5G e Economia de Aplicativos',
    category: 'Comunicação',
    inventionYear: 2007,
    mainstreamYear: 2013,
    dependencies: ['tech_internet', 'tech_electronics_tv'],
    originRegion: 'Estados Unidos / Global',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Telefones inteligentes transformam finanças (Pix), mobilidade, trabalho por app e redes sociais.',
    lifeExpectancyBonus: 0.5,
    productivityBonus: 7,
    unlockedCareers: ['Desenvolvedor Mobile', 'Criador de Conteúdo Digital', 'Motorista de Aplicativo'],
    obsoletedCareers: ['Revelador Fotográfico'],
  },
  {
    id: 'tech_renewable_grid',
    name: 'Energia Solar e Eólica em Escala Comercial',
    category: 'Energia',
    inventionYear: 2005,
    mainstreamYear: 2018,
    dependencies: ['tech_electronics_tv'],
    originRegion: 'Europa / Nordeste & Brasil',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Expansão solar e eólica reduz custo marginal de geração elétrica e cria empregos verdes.',
    lifeExpectancyBonus: 0.6,
    productivityBonus: 4,
    unlockedCareers: ['Engenheiro de Energia Renovável', 'Instalador Fotovoltaico'],
  },
  {
    id: 'tech_heavy_industry_modern',
    name: 'Manufatura Aditiva (Impressão 3D) e Indústria 4.0',
    category: 'Indústria',
    inventionYear: 2012,
    mainstreamYear: 2021,
    dependencies: ['tech_industrial_robotics', 'tech_internet'],
    originRegion: 'Alemanha / EUA / Sudeste BR',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Fábricas conectadas por sensores IoT e prototipagem rápida em metal e polímeros.',
    lifeExpectancyBonus: 0.2,
    productivityBonus: 5,
    unlockedCareers: ['Especialista em Indústria 4.0'],
  },
  {
    id: 'tech_generative_ai',
    name: 'Inteligência Artificial Generativa e Copilotos',
    category: 'Inteligência Artificial',
    inventionYear: 2022,
    mainstreamYear: 2024,
    dependencies: ['tech_internet', 'tech_smartphones'],
    originRegion: 'Estados Unidos / China / Global',
    truthStatus: 'HISTORICAL_FACT',
    description: 'Modelos multimodais automatizam análise de código, atendimento, educação e criação.',
    lifeExpectancyBonus: 0.8,
    productivityBonus: 9,
    unlockedCareers: ['Engenheiro de IA Aplicada', 'Especialista em Dados e Automação'],
  },
  {
    id: 'tech_precision_medicine',
    name: 'Medicina Genômica e Terapias Celulares (Projeção)',
    category: 'Biotecnologia',
    inventionYear: 2029,
    mainstreamYear: 2036,
    dependencies: ['tech_biotech_genomics', 'tech_generative_ai'],
    originRegion: 'Consórcios Globais de Saúde',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: edição genética e diagnóstico preditivo estendem anos de vida saudável.',
    lifeExpectancyBonus: 5.5,
    productivityBonus: 4,
    unlockedCareers: ['Geneticista Clínico', 'Bioinformata Terapêutico'],
    unlockedTreatments: ['Terapia Genômica Preventiva', 'Regeneração Tecidual Assistida'],
  },
  {
    id: 'tech_autonomous_robotics',
    name: 'Robótica Autônoma e Logística Urbana (Projeção)',
    category: 'Robótica',
    inventionYear: 2033,
    mainstreamYear: 2042,
    dependencies: ['tech_industrial_robotics', 'tech_generative_ai'],
    originRegion: 'Ásia-Pacífico / América do Norte',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: robôs colaborativos assumem transporte pesado e manufatura contínua.',
    lifeExpectancyBonus: 0.4,
    productivityBonus: 10,
    unlockedCareers: ['Supervisor de Frotas Autônomas', 'Técnico em Robótica Urbana'],
  },
  {
    id: 'tech_fusion_clean_energy',
    name: 'Armazenamento Ultra-Denso e Fusão Experimental (Projeção)',
    category: 'Energia',
    inventionYear: 2045,
    mainstreamYear: 2055,
    dependencies: ['tech_renewable_grid', 'tech_heavy_industry_modern'],
    originRegion: 'Consórcios Energéticos Internacionais',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: energia abundante e limpa reduz custo industrial global.',
    lifeExpectancyBonus: 1.0,
    productivityBonus: 11,
    unlockedCareers: ['Engenheiro de Redes Energéticas Avançadas'],
  },
  {
    id: 'tech_orbital_logistics',
    name: 'Infraestrutura Orbital e Mineração Espacial Inicial (Projeção)',
    category: 'Exploração Espacial',
    inventionYear: 2052,
    mainstreamYear: 2070,
    dependencies: ['tech_space_satellites', 'tech_autonomous_robotics'],
    originRegion: 'Agências e Consórcios Aeroespaciais',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: cadeias industriais em órbita baixa e energia solar espacial.',
    lifeExpectancyBonus: 0.3,
    productivityBonus: 8,
    unlockedCareers: ['Engenheiro de Operações Orbitais'],
  },
  {
    id: 'tech_quantum_computing',
    name: 'Computação Quântica Comercial e Criptografia Quântica',
    category: 'Computação',
    inventionYear: 2038,
    mainstreamYear: 2048,
    dependencies: ['tech_generative_ai'],
    originRegion: 'Consórcios Globais / Brasil',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: computadores quânticos aceleram simulações de novos fármacos e logística global.',
    lifeExpectancyBonus: 0.8,
    productivityBonus: 12,
    unlockedCareers: ['Engenheiro Quântico', 'Criptógrafo Quântico'],
  },
  {
    id: 'tech_neural_interfaces',
    name: 'Interfaces Cérebro-Máquina Diretas (BCI)',
    category: 'Robótica',
    inventionYear: 2048,
    mainstreamYear: 2060,
    dependencies: ['tech_generative_ai', 'tech_autonomous_robotics'],
    originRegion: 'América do Norte / Ásia / Brasil',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: comunicação neural de banda larga permite controle direto de maquinário e expansão cognitiva.',
    lifeExpectancyBonus: 1.5,
    productivityBonus: 14,
    unlockedCareers: ['Engenheiro de Neurointerfaces', 'Terapeuta Biônico'],
  },
  {
    id: 'tech_synthetic_biology',
    name: 'Biologia Sintética e Biorremediação Planetária',
    category: 'Biotecnologia',
    inventionYear: 2068,
    mainstreamYear: 2080,
    dependencies: ['tech_precision_medicine', 'tech_quantum_computing'],
    originRegion: 'Brasil (Amazônia) / Consórcios Internacionais',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: organismos projetados absorvem carbono e produzem biomateriais de alta resistência.',
    lifeExpectancyBonus: 3.5,
    productivityBonus: 10,
    unlockedCareers: ['Bioengenheiro Sintético', 'Ecólogo de Precisão'],
  },
  {
    id: 'tech_lunar_industrial_base',
    name: 'Complexo Industrial Lunar e Extração de Hélio-3',
    category: 'Exploração Espacial',
    inventionYear: 2110,
    mainstreamYear: 2140,
    dependencies: ['tech_orbital_logistics', 'tech_fusion_clean_energy'],
    originRegion: 'Consórcio Internacional Lunar',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: manufatura em baixa gravidade e combustível para fusão fornecido a partir da Lua.',
    lifeExpectancyBonus: 0.5,
    productivityBonus: 15,
    unlockedCareers: ['Supervisor de Planta Lunar', 'Engenheiro de Hélio-3'],
  },
  {
    id: 'tech_martian_terraforming',
    name: 'Engenharia Planetária e Terraformação Marciana',
    category: 'Exploração Espacial',
    inventionYear: 2220,
    mainstreamYear: 2300,
    dependencies: ['tech_lunar_industrial_base', 'tech_synthetic_biology'],
    originRegion: 'Federação Humana Interplanetária',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: espessamento atmosférico e liberação de água subsuperficial para biosfera marciana.',
    lifeExpectancyBonus: 1.0,
    productivityBonus: 18,
    unlockedCareers: ['Geoengenheiro Planetário', 'Astrobiólogo de Colonização'],
  },
  {
    id: 'tech_antimatter_propulsion',
    name: 'Propulsão Relativística por Antimatéria',
    category: 'Transporte',
    inventionYear: 2400,
    mainstreamYear: 2480,
    dependencies: ['tech_fusion_clean_energy', 'tech_quantum_computing'],
    originRegion: 'Rede Científica Interestelar',
    truthStatus: 'FUTURE_PROJECTION',
    description: 'Projeção simulada: confinamento magnético de pósitrons permite acelerar naves a frações da velocidade da luz.',
    lifeExpectancyBonus: 0.8,
    productivityBonus: 20,
    unlockedCareers: ['Piloto Interestelar', 'Físico de Antimatéria'],
  },
];

export function normalizeTechnologyCategory(raw: string): TechnologyCategory {
  if (raw === 'Medicina e Biotecnologia') return 'Medicina';
  if (raw === 'Entretenimento' || raw === 'Educação' || raw === 'Segurança' || raw === 'Militar') {
    return 'Comunicação';
  }
  return raw as TechnologyCategory;
}

export class WorldTechnologyEngine {
  static createInitialState(year: number): WorldTechnologyState {
    const unlockedIds = new Set<string>();
    const adoptedRates: Record<string, number> = {};
    const regionalAdoptionByTech: Record<string, Record<string, number>> = {};

    // Evaluate iteratively respecting dependency prerequisites
    let changed = true;
    while (changed) {
      changed = false;
      for (const tech of TECHNOLOGY_CATALOG) {
        if (unlockedIds.has(tech.id)) continue;
        if (tech.inventionYear > year) continue;
        const depsMet = tech.dependencies.every((d) => unlockedIds.has(d));
        if (depsMet) {
          unlockedIds.add(tech.id);
          changed = true;
        }
      }
    }

    const unlockedList = TECHNOLOGY_CATALOG.filter((t) => unlockedIds.has(t.id));
    for (const tech of unlockedList) {
      let rate = 12;
      if (year >= tech.mainstreamYear + 5) {
        rate = 88;
      } else if (year >= tech.mainstreamYear) {
        rate = 56;
      } else {
        const span = Math.max(1, tech.mainstreamYear - tech.inventionYear);
        rate = Math.round(12 + ((year - tech.inventionYear) / span) * 38);
      }
      adoptedRates[tech.id] = rate;
      regionalAdoptionByTech[tech.id] = {};
      for (const reg of REGIONS) {
        regionalAdoptionByTech[tech.id][reg] = Math.min(98, Math.round(rate * (REGION_DIFFUSION_SPEED[reg] ?? 0.9)));
      }
    }

    const globalIndex = Math.min(99, Math.max(8, Math.round(unlockedList.length * 4.8)));
    const brazilIndex = Math.max(5, Math.round(globalIndex * (year < 1995 ? 0.78 : 0.9)));

    return {
      globalTechIndex: globalIndex,
      brazilTechIndex: brazilIndex,
      unlockedTechIds: unlockedList.map((t) => t.id),
      adoptedTechRates: adoptedRates,
      regionalAdoptionByTech,
      recentBreakthroughs: unlockedList.slice(-5).map((t) => ({
        year: t.inventionYear,
        techId: t.id,
        name: t.name,
        category: t.category,
        truthStatus: t.truthStatus,
      })),
    };
  }

  static advanceYear(state: WorldTechnologyState, year: number): WorldTechnologyState {
    const unlockedIds = new Set(state.unlockedTechIds);
    const nextAdopted = { ...state.adoptedTechRates };
    const nextRegional: Record<string, Record<string, number>> = { ...(state.regionalAdoptionByTech || {}) };
    const nextBreakthroughs = [...state.recentBreakthroughs];

    for (const tech of TECHNOLOGY_CATALOG) {
      if (tech.inventionYear > year) continue;
      const depsMet = tech.dependencies.every((d) => unlockedIds.has(d));
      if (!depsMet) continue;

      if (!unlockedIds.has(tech.id)) {
        unlockedIds.add(tech.id);
        nextAdopted[tech.id] = 10;
        nextRegional[tech.id] = {};
        for (const reg of REGIONS) {
          nextRegional[tech.id][reg] = Math.round(10 * (REGION_DIFFUSION_SPEED[reg] ?? 0.9));
        }
        nextBreakthroughs.push({
          year,
          techId: tech.id,
          name: tech.name,
          category: tech.category,
          truthStatus: tech.truthStatus as WorldTruthStatus,
        });
      } else {
        const currentRate = nextAdopted[tech.id] ?? 10;
        const targetMax = year >= tech.mainstreamYear ? 94 : 50;
        const step = year >= tech.mainstreamYear ? 5.5 : 3.2;
        const updatedRate = Number(Math.min(targetMax, currentRate + step).toFixed(1));
        nextAdopted[tech.id] = updatedRate;
        if (!nextRegional[tech.id]) nextRegional[tech.id] = {};
        for (const reg of REGIONS) {
          const prevReg = nextRegional[tech.id][reg] ?? updatedRate * 0.85;
          const regTarget = Math.min(98, updatedRate * (REGION_DIFFUSION_SPEED[reg] ?? 0.9));
          nextRegional[tech.id][reg] = Number(Math.min(regTarget, prevReg + step * (REGION_DIFFUSION_SPEED[reg] ?? 0.9)).toFixed(1));
        }
      }
    }

    const avgAdoption =
      unlockedIds.size > 0
        ? Object.values(nextAdopted).reduce((s, v) => s + v, 0) / unlockedIds.size
        : 10;
    const globalIndex = Math.min(100, Math.round(unlockedIds.size * 3.6 + avgAdoption * 0.34));
    const brazilIndex = Math.min(98, Math.round(globalIndex * (year < 1995 ? 0.8 : 0.91)));

    return {
      globalTechIndex: globalIndex,
      brazilTechIndex: brazilIndex,
      unlockedTechIds: Array.from(unlockedIds),
      adoptedTechRates: nextAdopted,
      regionalAdoptionByTech: nextRegional,
      recentBreakthroughs: nextBreakthroughs.slice(-12),
    };
  }

  static isTechnologyUnlocked(state: WorldTechnologyState, techId: string): boolean {
    return state.unlockedTechIds.includes(techId);
  }

  static getCatalogForYear(year: number): TechnologyDefinition[] {
    return TECHNOLOGY_CATALOG.filter((t) => t.inventionYear <= year);
  }

  static getAvailableMedicalTreatments(year: number): {
    id: string;
    name: string;
    minYear: number;
    costCentavos: number;
    healthBoost: number;
    requiresTechId?: string;
  }[] {
    const treatments = [
      { id: 'trat_clinico', name: 'Consulta Médica e Cuidados Gerais', minYear: 1850, costCentavos: 25000, healthBoost: 6 },
      { id: 'trat_vacina', name: 'Campanha de Vacinação & Prevenção', minYear: 1920, costCentavos: 12000, healthBoost: 8 },
      { id: 'trat_antibiotico', name: 'Antibioticoterapia e Check-up Completo', minYear: 1945, costCentavos: 60000, healthBoost: 11, requiresTechId: 'tech_penicillin_antibiotics' },
      { id: 'trat_cardiologia', name: 'Cirurgia Preventiva e Reabilitação', minYear: 1975, costCentavos: 250000, healthBoost: 16 },
      { id: 'trat_biotec', name: 'Medicina Integrativa & Diagnóstico Digital', minYear: 2015, costCentavos: 450000, healthBoost: 20, requiresTechId: 'tech_biotech_genomics' },
      { id: 'trat_genomica', name: 'Terapia Genômica & Regeneração Celular (Projeção)', minYear: 2032, costCentavos: 1200000, healthBoost: 28, requiresTechId: 'tech_precision_medicine' },
    ];
    return treatments.filter((t) => year >= t.minYear);
  }
}
