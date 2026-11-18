import {
  BusinessSector,
  CompanyEntity,
  JobMarketRole,
  WorldState,
} from '../types/world';

interface CompanyTemplate {
  id: string;
  name: string;
  sector: BusinessSector;
  city: string;
  foundedYear: number;
  baseValuation: number;
  baseEmployees: number;
  minTech: number;
  maxYear?: number;
}

const COMPANY_SEEDS: CompanyTemplate[] = [
  { id: 'comp_casa_comercio', name: 'Armazéns Brasil Central', sector: 'Comércio', city: 'São Paulo', foundedYear: 1910, baseValuation: 0.4, baseEmployees: 2400, minTech: 0 },
  { id: 'comp_cafe_export', name: 'Companhia Paulista de Exportação', sector: 'Agropecuária', city: 'Campinas', foundedYear: 1895, baseValuation: 0.9, baseEmployees: 4200, minTech: 0 },
  { id: 'comp_banco_nacional', name: 'Banco do Brasil S.A.', sector: 'Finanças', city: 'Rio de Janeiro', foundedYear: 1808, baseValuation: 48.0, baseEmployees: 85000, minTech: 5 },
  { id: 'comp_metalurgica', name: 'Siderúrgica Nacional Integrada', sector: 'Indústria', city: 'Rio de Janeiro', foundedYear: 1941, baseValuation: 16.5, baseEmployees: 22000, minTech: 12 },
  { id: 'comp_hospital_vida', name: 'Rede Hospitalar Santa Vida', sector: 'Saúde', city: 'Belo Horizonte', foundedYear: 1952, baseValuation: 5.2, baseEmployees: 11500, minTech: 15 },
  { id: 'comp_rede_tv', name: 'Rede Brasil de Radiodifusão e TV', sector: 'Entretenimento', city: 'Rio de Janeiro', foundedYear: 1965, baseValuation: 11.0, baseEmployees: 9800, minTech: 20 },
  { id: 'comp_agro_verde', name: 'AgroSul Cooperativa Moderna', sector: 'Agropecuária', city: 'Curitiba', foundedYear: 1974, baseValuation: 8.8, baseEmployees: 14000, minTech: 25 },
  { id: 'comp_construtora_horizonte', name: 'Construtora Horizonte Brasil', sector: 'Construção', city: 'Brasília', foundedYear: 1960, baseValuation: 6.4, baseEmployees: 16000, minTech: 18 },
  { id: 'comp_log_express', name: 'TransBrasil Logística', sector: 'Logística', city: 'Goiânia', foundedYear: 1982, baseValuation: 4.5, baseEmployees: 13200, minTech: 30 },
  { id: 'comp_tech_brasil', name: 'TechBrasil Sistemas S.A.', sector: 'Tecnologia', city: 'São Paulo', foundedYear: 1998, baseValuation: 14.2, baseEmployees: 7600, minTech: 45 },
  { id: 'comp_fintech_pix', name: 'Banco Digital Nação', sector: 'Finanças', city: 'São Paulo', foundedYear: 2016, baseValuation: 26.0, baseEmployees: 6800, minTech: 65 },
  { id: 'comp_solar_nordeste', name: 'SolBras Energia Limpa', sector: 'Energia', city: 'Fortaleza', foundedYear: 2017, baseValuation: 9.5, baseEmployees: 4100, minTech: 62 },
  { id: 'comp_edtech_saber', name: 'Instituto Saber Digital', sector: 'Educação', city: 'Florianópolis', foundedYear: 2012, baseValuation: 2.8, baseEmployees: 2900, minTech: 55 },
  { id: 'comp_ia_nexus', name: 'Nexus IA & Automação Brasil', sector: 'Tecnologia', city: 'Campinas', foundedYear: 2024, baseValuation: 7.4, baseEmployees: 1900, minTech: 75 },
  { id: 'comp_quantum_br', name: 'Brasil Quântico Computação', sector: 'Tecnologia', city: 'São Paulo', foundedYear: 2038, baseValuation: 18.5, baseEmployees: 3200, minTech: 82 },
  { id: 'comp_alcantara_space', name: 'Alcântara Espaço & Logística Orbital', sector: 'Logística', city: 'São Luís', foundedYear: 2040, baseValuation: 24.0, baseEmployees: 5400, minTech: 80 },
  { id: 'comp_fusao_energia', name: 'Fusão Limpa Sul-Americana', sector: 'Energia', city: 'Rio de Janeiro', foundedYear: 2055, baseValuation: 45.0, baseEmployees: 8800, minTech: 88 },
  { id: 'comp_biorregeneracao', name: 'Biomateriais Amazônia Regenerativa', sector: 'Indústria', city: 'Manaus', foundedYear: 2065, baseValuation: 32.0, baseEmployees: 6100, minTech: 85 },
];

export const ROLE_CATALOG: JobMarketRole[] = [
  // Aprendiz & Informal
  { id: 'role_aprendiz', title: 'Auxiliar / Jovem Aprendiz', sector: 'Comércio', careerTrack: 'Aprendiz', companyName: 'Armazéns Brasil Central', minEducation: 'Nenhum', minAge: 16, minYear: 1900, baseAnnualSalaryCentavos: 1800000, prestige: 22, economySensitivity: 0.5 },
  { id: 'role_autonomo_entregador', title: 'Entregador / Motorista por Aplicativo', sector: 'Logística', careerTrack: 'Informal', companyName: 'TransBrasil Logística', minEducation: 'Nenhum', minAge: 18, minYear: 2014, requiredTechId: 'tech_smartphones', baseAnnualSalaryCentavos: 2900000, prestige: 30, economySensitivity: 0.75 },
  { id: 'role_feirante', title: 'Feirante & Comerciante Autônomo', sector: 'Comércio', careerTrack: 'Autônomo', companyName: 'Armazéns Brasil Central', minEducation: 'Nenhum', minAge: 18, minYear: 1900, baseAnnualSalaryCentavos: 2520000, prestige: 32, economySensitivity: 0.65 },
  { id: 'role_freelancer_criativo', title: 'Designer & Freelancer Digital', sector: 'Tecnologia', careerTrack: 'Autônomo', companyName: 'TechBrasil Sistemas S.A.', minEducation: 'Médio', minAge: 18, minYear: 2002, requiredTechId: 'tech_internet', baseAnnualSalaryCentavos: 6200000, prestige: 58, economySensitivity: 0.6 },
  // Históricas / Extintas
  { id: 'role_telegrafista', title: 'Operador de Telégrafo & Correios', sector: 'Comércio', careerTrack: 'Histórica', companyName: 'Armazéns Brasil Central', minEducation: 'Fundamental', minAge: 18, minYear: 1900, maxYear: 1978, isExtinct: true, baseAnnualSalaryCentavos: 2400000, prestige: 40, economySensitivity: 0.35 },
  { id: 'role_datilografo', title: 'Datilógrafo & Arquivista de Cartório', sector: 'Finanças', careerTrack: 'Histórica', companyName: 'Banco do Brasil S.A.', minEducation: 'Médio', minAge: 18, minYear: 1920, maxYear: 1995, isExtinct: true, baseAnnualSalaryCentavos: 2800000, prestige: 44, economySensitivity: 0.4 },
  { id: 'role_lanterninha', title: 'Bilheteiro & Projecionista Analógico', sector: 'Entretenimento', careerTrack: 'Histórica', companyName: 'Rede Brasil de Radiodifusão e TV', minEducation: 'Fundamental', minAge: 18, minYear: 1925, maxYear: 2008, isExtinct: true, baseAnnualSalaryCentavos: 2300000, prestige: 36, economySensitivity: 0.5 },
  // Rural & Industrial & Comércio
  { id: 'role_agricultor', title: 'Produtor Rural & Técnico Agrícola', sector: 'Agropecuária', careerTrack: 'Rural', companyName: 'Companhia Paulista de Exportação', minEducation: 'Fundamental', minAge: 16, minYear: 1900, baseAnnualSalaryCentavos: 3100000, prestige: 42, economySensitivity: 0.55 },
  { id: 'role_comercio', title: 'Vendedor / Comerciante Local', sector: 'Comércio', careerTrack: 'Formal', companyName: 'Armazéns Brasil Central', minEducation: 'Fundamental', minAge: 18, minYear: 1900, baseAnnualSalaryCentavos: 2640000, prestige: 34, economySensitivity: 0.7 },
  { id: 'role_pedreiro_mestre', title: 'Mestre de Obras & Construção Civil', sector: 'Construção', careerTrack: 'Formal', companyName: 'Construtora Horizonte Brasil', minEducation: 'Fundamental', minAge: 18, minYear: 1900, baseAnnualSalaryCentavos: 3960000, prestige: 46, economySensitivity: 0.8 },
  { id: 'role_operario', title: 'Técnico Industrial / Metalúrgico', sector: 'Indústria', careerTrack: 'Industrial', companyName: 'Siderúrgica Nacional Integrada', minEducation: 'Médio', minAge: 18, minYear: 1940, baseAnnualSalaryCentavos: 4200000, prestige: 48, economySensitivity: 0.8 },
  { id: 'role_motorista_rodoviario', title: 'Motorista Logístico de Cargas', sector: 'Logística', careerTrack: 'Formal', companyName: 'TransBrasil Logística', minEducation: 'Fundamental', minAge: 21, minYear: 1955, baseAnnualSalaryCentavos: 4500000, prestige: 45, economySensitivity: 0.7 },
  // Educação, Saúde, Cultura, Esportes, Religioso
  { id: 'role_professor', title: 'Professor de Rede Escolar', sector: 'Educação', careerTrack: 'Educação', companyName: 'Instituto Saber Digital', minEducation: 'Universidade', minAge: 21, minYear: 1900, baseAnnualSalaryCentavos: 5400000, prestige: 64, economySensitivity: 0.25 },
  { id: 'role_pesquisador_univ', title: 'Pesquisador & Professor Universitário', sector: 'Educação', careerTrack: 'Educação', companyName: 'Instituto Saber Digital', minEducation: 'Pós-graduação', minAge: 25, minYear: 1934, baseAnnualSalaryCentavos: 11800000, prestige: 88, requiredIntelligence: 68, economySensitivity: 0.2 },
  { id: 'role_enfermeiro', title: 'Enfermeiro / Técnico Hospitalar', sector: 'Saúde', careerTrack: 'Saúde', companyName: 'Rede Hospitalar Santa Vida', minEducation: 'Universidade', minAge: 21, minYear: 1920, baseAnnualSalaryCentavos: 6800000, prestige: 74, economySensitivity: 0.2 },
  { id: 'role_medico', title: 'Médico Clínico / Cirurgião', sector: 'Saúde', careerTrack: 'Saúde', companyName: 'Rede Hospitalar Santa Vida', minEducation: 'Universidade', minAge: 24, minYear: 1900, baseAnnualSalaryCentavos: 18600000, prestige: 92, requiredIntelligence: 65, economySensitivity: 0.15 },
  { id: 'role_radialista', title: 'Jornalista / Produtor de Mídia', sector: 'Entretenimento', careerTrack: 'Cultura', companyName: 'Rede Brasil de Radiodifusão e TV', minEducation: 'Médio', minAge: 19, minYear: 1935, requiredTechId: 'tech_telegraph_radio', baseAnnualSalaryCentavos: 5200000, prestige: 62, economySensitivity: 0.5 },
  { id: 'role_artista_musico', title: 'Músico / Artista Cultural', sector: 'Entretenimento', careerTrack: 'Cultura', companyName: 'Rede Brasil de Radiodifusão e TV', minEducation: 'Nenhum', minAge: 18, minYear: 1900, baseAnnualSalaryCentavos: 4800000, prestige: 66, economySensitivity: 0.7 },
  { id: 'role_atleta', title: 'Atleta Profissional / Preparador Físico', sector: 'Entretenimento', careerTrack: 'Esportes', companyName: 'Clube Esportivo Nacional', minEducation: 'Fundamental', minAge: 17, minYear: 1930, baseAnnualSalaryCentavos: 8400000, prestige: 78, economySensitivity: 0.55 },
  { id: 'role_lider_comunitario_rel', title: 'Capelão / Educador Comunitário Filantrópico', sector: 'Educação', careerTrack: 'Religioso', companyName: 'Instituição Social e Comunitária', minEducation: 'Médio', minAge: 22, minYear: 1900, baseAnnualSalaryCentavos: 3600000, prestige: 60, economySensitivity: 0.2 },
  // Finanças, Executivo, Empreendedor
  { id: 'role_bancario', title: 'Analista Financeiro / Bancário', sector: 'Finanças', careerTrack: 'Formal', companyName: 'Banco do Brasil S.A.', minEducation: 'Universidade', minAge: 21, minYear: 1920, baseAnnualSalaryCentavos: 7800000, prestige: 72, economySensitivity: 0.6 },
  { id: 'role_executivo', title: 'Diretor Executivo / Gestor Corporativo', sector: 'Finanças', careerTrack: 'Executivo', companyName: 'Banco Digital Nação', minEducation: 'Pós-graduação', minAge: 28, minYear: 1960, baseAnnualSalaryCentavos: 24000000, prestige: 90, requiredIntelligence: 64, economySensitivity: 0.65 },
  { id: 'role_empreendedor', title: 'Empreendedor / Sócio-Fundador (MEI/PME)', sector: 'Comércio', careerTrack: 'Empreendedor', companyName: 'Empreendimento Próprio', minEducation: 'Médio', minAge: 20, minYear: 1900, baseAnnualSalaryCentavos: 9600000, prestige: 76, economySensitivity: 0.85 },
  // Concurso Público, Polícia, Militar, Magistratura, Diplomacia
  { id: 'role_auditor_fiscal', title: 'Auditor Fiscal / Servidor Concursado', sector: 'Finanças', careerTrack: 'Concurso Público', companyName: 'Receita & Administração Pública', minEducation: 'Universidade', minAge: 23, minYear: 1940, baseAnnualSalaryCentavos: 19500000, prestige: 88, requiredIntelligence: 68, economySensitivity: 0.1 },
  { id: 'role_policial_militar', title: 'Soldado / Oficial da Polícia Militar (PM)', sector: 'Logística', careerTrack: 'Polícia', companyName: 'Segurança Pública Estadual (PM)', minEducation: 'Médio', minAge: 18, minYear: 1900, baseAnnualSalaryCentavos: 6600000, prestige: 68, economySensitivity: 0.15, legalRiskPct: 4 },
  { id: 'role_delegado_pc', title: 'Delegado / Investigador da Polícia Civil', sector: 'Finanças', careerTrack: 'Polícia', companyName: 'Polícia Civil Judiciária', minEducation: 'Universidade', minAge: 22, minYear: 1930, baseAnnualSalaryCentavos: 14500000, prestige: 82, requiredIntelligence: 60, economySensitivity: 0.15 },
  { id: 'role_agente_pf', title: 'Agente / Perito da Polícia Federal (PF)', sector: 'Tecnologia', careerTrack: 'Polícia', companyName: 'Polícia Federal do Brasil', minEducation: 'Universidade', minAge: 23, minYear: 1944, baseAnnualSalaryCentavos: 17800000, prestige: 89, requiredIntelligence: 66, economySensitivity: 0.1 },
  { id: 'role_militar_carreira', title: 'Oficial das Forças Armadas', sector: 'Logística', careerTrack: 'Militar', companyName: 'Forças Armadas Brasileiras', minEducation: 'Médio', minAge: 18, minYear: 1900, baseAnnualSalaryCentavos: 9400000, prestige: 80, economySensitivity: 0.1 },
  { id: 'role_advogado', title: 'Advogado / Consultor Jurídico', sector: 'Finanças', careerTrack: 'Formal', companyName: 'Escritório Paulista Associados', minEducation: 'Universidade', minAge: 22, minYear: 1900, baseAnnualSalaryCentavos: 13200000, prestige: 84, economySensitivity: 0.4 },
  { id: 'role_defensor_promotor', title: 'Promotor de Justiça / Defensor Público', sector: 'Finanças', careerTrack: 'Magistratura', companyName: 'Ministério Público & Defensoria', minEducation: 'Universidade', minAge: 25, minYear: 1930, baseAnnualSalaryCentavos: 24500000, prestige: 93, requiredIntelligence: 72, economySensitivity: 0.1 },
  { id: 'role_juiz', title: 'Juiz de Direito / Magistrado', sector: 'Finanças', careerTrack: 'Magistratura', companyName: 'Tribunal de Justiça / Poder Judiciário', minEducation: 'Pós-graduação', minAge: 27, minYear: 1900, baseAnnualSalaryCentavos: 29500000, prestige: 96, requiredIntelligence: 76, economySensitivity: 0.08 },
  { id: 'role_diplomata', title: 'Diplomata do Itamaraty', sector: 'Finanças', careerTrack: 'Diplomacia', companyName: 'Ministério das Relações Exteriores', minEducation: 'Universidade', minAge: 24, minYear: 1900, baseAnnualSalaryCentavos: 22000000, prestige: 94, requiredIntelligence: 75, economySensitivity: 0.1 },
  // Agro, Engenharia, Tecnologia & Futuro
  { id: 'role_agronomo', title: 'Engenheiro Agrônomo', sector: 'Agropecuária', careerTrack: 'Rural', companyName: 'AgroSul Cooperativa Moderna', minEducation: 'Universidade', minAge: 22, minYear: 1965, baseAnnualSalaryCentavos: 9200000, prestige: 74, economySensitivity: 0.4 },
  { id: 'role_dev', title: 'Engenheiro de Software', sector: 'Tecnologia', careerTrack: 'Tecnologia', companyName: 'TechBrasil Sistemas S.A.', minEducation: 'Universidade', minAge: 20, minYear: 1995, requiredTechId: 'tech_internet', baseAnnualSalaryCentavos: 14400000, prestige: 86, requiredIntelligence: 55, economySensitivity: 0.55 },
  { id: 'role_energia', title: 'Engenheiro de Energia Renovável', sector: 'Energia', careerTrack: 'Tecnologia', companyName: 'SolBras Energia Limpa', minEducation: 'Universidade', minAge: 22, minYear: 2015, requiredTechId: 'tech_renewable_grid', baseAnnualSalaryCentavos: 13800000, prestige: 82, economySensitivity: 0.4 },
  { id: 'role_ia', title: 'Especialista em IA & Dados', sector: 'Tecnologia', careerTrack: 'Tecnologia', companyName: 'Nexus IA & Automação Brasil', minEducation: 'Universidade', minAge: 21, minYear: 2023, requiredTechId: 'tech_generative_ai', baseAnnualSalaryCentavos: 19800000, prestige: 90, requiredIntelligence: 68, economySensitivity: 0.45 },
  { id: 'role_bio', title: 'Cientista em Biotecnologia / Genômica', sector: 'Saúde', careerTrack: 'Tecnologia', companyName: 'Rede Hospitalar Santa Vida', minEducation: 'Universidade', minAge: 23, minYear: 2020, requiredTechId: 'tech_biotech_genomics', baseAnnualSalaryCentavos: 18200000, prestige: 91, requiredIntelligence: 66, economySensitivity: 0.3 },
  { id: 'role_quantum', title: 'Engenheiro de Sistemas Quânticos', sector: 'Tecnologia', careerTrack: 'Tecnologia', companyName: 'Brasil Quântico Computação', minEducation: 'Universidade', minAge: 22, minYear: 2038, requiredTechId: 'tech_quantum_computing', baseAnnualSalaryCentavos: 24000000, prestige: 94, requiredIntelligence: 72, economySensitivity: 0.35 },
  { id: 'role_orbital', title: 'Piloto & Engenheiro de Carga Orbital', sector: 'Logística', careerTrack: 'Tecnologia', companyName: 'Alcântara Espaço & Logística Orbital', minEducation: 'Universidade', minAge: 24, minYear: 2045, requiredTechId: 'tech_orbital_logistics', baseAnnualSalaryCentavos: 26500000, prestige: 93, requiredIntelligence: 70, economySensitivity: 0.4 },
  { id: 'role_fusao', title: 'Engenheiro de Reator de Fusão', sector: 'Energia', careerTrack: 'Tecnologia', companyName: 'Fusão Limpa Sul-Americana', minEducation: 'Universidade', minAge: 24, minYear: 2055, requiredTechId: 'tech_fusion_clean_energy', baseAnnualSalaryCentavos: 28000000, prestige: 95, requiredIntelligence: 75, economySensitivity: 0.25 },
  { id: 'role_neuro', title: 'Engenheiro de Neurointerfaces (BCI)', sector: 'Tecnologia', careerTrack: 'Tecnologia', companyName: 'Brasil Quântico Computação', minEducation: 'Universidade', minAge: 23, minYear: 2050, requiredTechId: 'tech_neural_interfaces', baseAnnualSalaryCentavos: 27500000, prestige: 94, requiredIntelligence: 74, economySensitivity: 0.3 },
];

export class GlobalBusinessEvolutionEngine {
  static createInitialCompanies(year: number, brazilTechIndex: number): CompanyEntity[] {
    return COMPANY_SEEDS.filter(
      (c) => year >= c.foundedYear && (!c.maxYear || year <= c.maxYear)
    ).map((c) => {
      const age = Math.max(1, year - c.foundedYear);
      const scale = Math.min(2.8, 0.45 + age * 0.045);
      return {
        id: c.id,
        name: c.name,
        sector: c.sector,
        countryId: 'BRA',
        headquartersCity: c.city,
        foundedYear: c.foundedYear,
        status: brazilTechIndex >= c.minTech ? 'Ativa' : 'Em Crise',
        valuationBillionsBRL: Number((c.baseValuation * scale).toFixed(2)),
        revenueGrowthPct: 4.2,
        employeesCount: Math.round(c.baseEmployees * scale),
        hiringCapacity: 68,
        minTechIndexRequired: c.minTech,
        minYearAvailable: c.foundedYear,
        maxYearAvailable: c.maxYear,
      };
    });
  }

  static advanceYear(world: WorldState, year: number): void {
    const existingIds = new Set(world.companies.map((c) => c.id));

    for (const seed of COMPANY_SEEDS) {
      if (year >= seed.foundedYear && !existingIds.has(seed.id)) {
        world.companies.push({
          id: seed.id,
          name: seed.name,
          sector: seed.sector,
          countryId: 'BRA',
          headquartersCity: seed.city,
          foundedYear: seed.foundedYear,
          status: 'Em Expansão',
          valuationBillionsBRL: Number((seed.baseValuation * 0.45).toFixed(2)),
          revenueGrowthPct: 12.0,
          employeesCount: Math.max(120, Math.round(seed.baseEmployees * 0.35)),
          hiringCapacity: 82,
          minTechIndexRequired: seed.minTech,
          minYearAvailable: seed.foundedYear,
        });
      }
    }

    const gdpGrowth = world.brazil.gdpGrowthRate;
    const isRecession = gdpGrowth < -0.5;

    world.companies = world.companies.map((comp, idx) => {
      if (comp.status === 'Faliu' || comp.status === 'Adquirida') return comp;

      const techBonus = comp.sector === 'Tecnologia' || comp.sector === 'Energia' ? 3.5 : 0.8;
      const revGrowth = Number((gdpGrowth * 1.45 + techBonus - (isRecession ? 4.5 : 0)).toFixed(1));
      const valFactor = Math.max(0.7, 1 + revGrowth / 100);
      const nextVal = Number(Math.max(0.05, comp.valuationBillionsBRL * valFactor).toFixed(2));
      const empFactor = isRecession ? 0.96 : 1 + Math.max(0, revGrowth) * 0.004;
      const nextEmp = Math.max(30, Math.round(comp.employeesCount * empFactor));

      let nextStatus: CompanyEntity['status'] = comp.status;
      let acquiredBy = comp.acquiredBy;

      if (nextVal <= 0.08 && isRecession && !comp.playerOwned && idx % 3 === 0) {
        nextStatus = 'Faliu';
      } else if (nextVal < 0.14 && revGrowth < -2.5 && !comp.playerOwned && year % 7 === 0) {
        nextStatus = 'Adquirida';
        acquiredBy = 'Banco do Brasil S.A.';
      } else if (nextVal < 0.2 && isRecession) {
        nextStatus = 'Em Crise';
      } else if (revGrowth > 7.5) {
        nextStatus = 'Em Expansão';
      } else if (revGrowth < -3.0) {
        nextStatus = 'Em Crise';
      } else {
        nextStatus = 'Ativa';
      }

      const hiringCap =
        nextStatus === 'Faliu'
          ? 0
          : Math.max(
              10,
              Math.min(98, Math.round(62 + revGrowth * 2.5 - world.brazil.unemploymentRate * 1.2))
            );

      return {
        ...comp,
        status: nextStatus,
        acquiredBy,
        valuationBillionsBRL: nextVal,
        revenueGrowthPct: revGrowth,
        employeesCount: nextEmp,
        hiringCapacity: hiringCap,
      };
    });
  }

  static getAvailableJobs(
    world: WorldState,
    characterAge: number,
    educationLevel: string,
    cityName?: string
  ): JobMarketRole[] {
    const year = world.clock.year;
    const eduRank: Record<string, number> = {
      Nenhum: 0,
      Fundamental: 1,
      Médio: 2,
      Universidade: 3,
      'Pós-graduação': 4,
    };
    const charEdu = eduRank[educationLevel] ?? 0;
    const macroSalaryScale = Math.max(0.55, Math.min(2500, world.economy.costOfLivingMultiplier));
    const realWageScale = Math.max(0.65, (world.brazil.realWageIndex || 100) / 100);
    const city = cityName
      ? Object.values(world.brazil.cities).find((c) => c.name === cityName)
      : undefined;
    const regionalDemandFactor = city ? Math.max(0.75, Math.min(1.28, city.jobOpportunityIndex / 70)) : 1.0;

    return ROLE_CATALOG.filter((r) => {
      if (year < r.minYear || (r.maxYear && year > r.maxYear)) return false;
      if (r.requiredTechId && !world.technology.unlockedTechIds.includes(r.requiredTechId)) {
        return false;
      }
      if (characterAge < r.minAge) return false;
      const reqEdu = eduRank[r.minEducation] ?? 0;
      return charEdu >= reqEdu - 1;
    }).map((role) => {
      const matchingCompany = world.companies.find((c) => c.name === role.companyName);
      const companyHealthBonus =
        matchingCompany?.status === 'Em Expansão'
          ? 1.12
          : matchingCompany?.status === 'Em Crise'
            ? 0.9
            : 1.0;

      return {
        ...role,
        regionalDemandFactor: Number(regionalDemandFactor.toFixed(2)),
        baseAnnualSalaryCentavos: Math.round(
          role.baseAnnualSalaryCentavos *
            macroSalaryScale *
            realWageScale *
            regionalDemandFactor *
            companyHealthBonus
        ),
      };
    });
  }

  static getRoleById(
    world: WorldState,
    roleId: string,
    characterAge: number,
    educationLevel: string,
    cityName?: string
  ): JobMarketRole | null {
    return (
      this.getAvailableJobs(world, characterAge, educationLevel, cityName).find(
        (r) => r.id === roleId
      ) || null
    );
  }
}
