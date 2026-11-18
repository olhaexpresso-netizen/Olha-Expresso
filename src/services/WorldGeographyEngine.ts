import {
  BrazilStateInfo,
  BusinessSector,
  CityEvolutionMetrics,
  CitySettlementTier,
  CountryState,
  InternationalConflictRecord,
  InternationalTreatyRecord,
} from '../types/world';

export const BRAZIL_STATES: BrazilStateInfo[] = [
  { code: 'SP', name: 'São Paulo', region: 'Sudeste', capital: 'São Paulo', populationShare: 0.218, gdpIndex: 1.38, urbanizationBase: 96 },
  { code: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste', capital: 'Rio de Janeiro', populationShare: 0.079, gdpIndex: 1.18, urbanizationBase: 97 },
  { code: 'MG', name: 'Minas Gerais', region: 'Sudeste', capital: 'Belo Horizonte', populationShare: 0.101, gdpIndex: 0.98, urbanizationBase: 86 },
  { code: 'ES', name: 'Espírito Santo', region: 'Sudeste', capital: 'Vitória', populationShare: 0.019, gdpIndex: 1.02, urbanizationBase: 85 },
  { code: 'BA', name: 'Bahia', region: 'Nordeste', capital: 'Salvador', populationShare: 0.070, gdpIndex: 0.72, urbanizationBase: 74 },
  { code: 'PE', name: 'Pernambuco', region: 'Nordeste', capital: 'Recife', populationShare: 0.045, gdpIndex: 0.76, urbanizationBase: 81 },
  { code: 'CE', name: 'Ceará', region: 'Nordeste', capital: 'Fortaleza', populationShare: 0.043, gdpIndex: 0.71, urbanizationBase: 76 },
  { code: 'RS', name: 'Rio Grande do Sul', region: 'Sul', capital: 'Porto Alegre', populationShare: 0.054, gdpIndex: 1.08, urbanizationBase: 86 },
  { code: 'PR', name: 'Paraná', region: 'Sul', capital: 'Curitiba', populationShare: 0.056, gdpIndex: 1.10, urbanizationBase: 87 },
  { code: 'SC', name: 'Santa Catarina', region: 'Sul', capital: 'Florianópolis', populationShare: 0.037, gdpIndex: 1.16, urbanizationBase: 85 },
  { code: 'GO', name: 'Goiás', region: 'Centro-Oeste', capital: 'Goiânia', populationShare: 0.034, gdpIndex: 0.96, urbanizationBase: 90 },
  { code: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste', capital: 'Brasília', populationShare: 0.014, gdpIndex: 1.55, urbanizationBase: 97 },
  { code: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste', capital: 'Cuiabá', populationShare: 0.018, gdpIndex: 1.12, urbanizationBase: 82 },
  { code: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste', capital: 'Campo Grande', populationShare: 0.013, gdpIndex: 1.00, urbanizationBase: 86 },
  { code: 'AM', name: 'Amazonas', region: 'Norte', capital: 'Manaus', populationShare: 0.020, gdpIndex: 0.84, urbanizationBase: 79 },
  { code: 'PA', name: 'Pará', region: 'Norte', capital: 'Belém', populationShare: 0.041, gdpIndex: 0.68, urbanizationBase: 69 },
  { code: 'MA', name: 'Maranhão', region: 'Nordeste', capital: 'São Luís', populationShare: 0.033, gdpIndex: 0.58, urbanizationBase: 64 },
  { code: 'PB', name: 'Paraíba', region: 'Nordeste', capital: 'João Pessoa', populationShare: 0.019, gdpIndex: 0.66, urbanizationBase: 76 },
  { code: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste', capital: 'Natal', populationShare: 0.016, gdpIndex: 0.72, urbanizationBase: 78 },
  { code: 'AL', name: 'Alagoas', region: 'Nordeste', capital: 'Maceió', populationShare: 0.015, gdpIndex: 0.62, urbanizationBase: 74 },
  { code: 'PI', name: 'Piauí', region: 'Nordeste', capital: 'Teresina', populationShare: 0.016, gdpIndex: 0.59, urbanizationBase: 66 },
  { code: 'SE', name: 'Sergipe', region: 'Nordeste', capital: 'Aracaju', populationShare: 0.011, gdpIndex: 0.70, urbanizationBase: 74 },
  { code: 'RO', name: 'Rondônia', region: 'Norte', capital: 'Porto Velho', populationShare: 0.008, gdpIndex: 0.80, urbanizationBase: 74 },
  { code: 'TO', name: 'Tocantins', region: 'Norte', capital: 'Palmas', populationShare: 0.008, gdpIndex: 0.79, urbanizationBase: 79 },
  { code: 'AC', name: 'Acre', region: 'Norte', capital: 'Rio Branco', populationShare: 0.004, gdpIndex: 0.66, urbanizationBase: 73 },
  { code: 'AP', name: 'Amapá', region: 'Norte', capital: 'Macapá', populationShare: 0.004, gdpIndex: 0.70, urbanizationBase: 89 },
  { code: 'RR', name: 'Roraima', region: 'Norte', capital: 'Boa Vista', populationShare: 0.003, gdpIndex: 0.74, urbanizationBase: 77 },
];

export interface CitySeed {
  id: string;
  name: string;
  state: string;
  ufCode: string;
  region: BrazilStateInfo['region'];
  tier: CitySettlementTier;
  foundedYear: number;
  basePop2020: number;
  urbanRate: number;
  devIndex2020: number;
  costOfLiving: number;
  safety: number;
  jobOpp: number;
  climateRisk: number;
  sectors: BusinessSector[];
}

export const BRAZIL_CITY_SEEDS: CitySeed[] = [
  // Sudeste
  { id: 'sp_capital', name: 'São Paulo', state: 'São Paulo', ufCode: 'SP', region: 'Sudeste', tier: 'metropole', foundedYear: 1554, basePop2020: 11450000, urbanRate: 99, devIndex2020: 0.81, costOfLiving: 128, safety: 58, jobOpp: 92, climateRisk: 48, sectors: ['Finanças', 'Tecnologia', 'Comércio', 'Indústria', 'Entretenimento'] },
  { id: 'sp_campinas', name: 'Campinas', state: 'São Paulo', ufCode: 'SP', region: 'Sudeste', tier: 'interior', foundedYear: 1774, basePop2020: 1140000, urbanRate: 98, devIndex2020: 0.82, costOfLiving: 112, safety: 66, jobOpp: 82, climateRisk: 38, sectors: ['Tecnologia', 'Indústria', 'Educação', 'Logística'] },
  { id: 'sp_santos', name: 'Santos (Porto Principal)', state: 'São Paulo', ufCode: 'SP', region: 'Sudeste', tier: 'interior', foundedYear: 1546, basePop2020: 433000, urbanRate: 100, devIndex2020: 0.84, costOfLiving: 116, safety: 62, jobOpp: 80, climateRisk: 52, sectors: ['Logística', 'Comércio', 'Entretenimento'] },
  { id: 'sp_ribeirao_preto', name: 'Ribeirão Preto', state: 'São Paulo', ufCode: 'SP', region: 'Sudeste', tier: 'interior', foundedYear: 1856, basePop2020: 698000, urbanRate: 99, devIndex2020: 0.81, costOfLiving: 102, safety: 68, jobOpp: 78, climateRisk: 42, sectors: ['Agropecuária', 'Saúde', 'Comércio', 'Educação'] },
  { id: 'rj_capital', name: 'Rio de Janeiro', state: 'Rio de Janeiro', ufCode: 'RJ', region: 'Sudeste', tier: 'metropole', foundedYear: 1565, basePop2020: 6210000, urbanRate: 100, devIndex2020: 0.80, costOfLiving: 124, safety: 48, jobOpp: 83, climateRisk: 56, sectors: ['Energia', 'Entretenimento', 'Finanças', 'Comércio'] },
  { id: 'rj_petropolis', name: 'Petrópolis (Cidade Imperial)', state: 'Rio de Janeiro', ufCode: 'RJ', region: 'Sudeste', tier: 'interior', foundedYear: 1843, basePop2020: 298000, urbanRate: 96, devIndex2020: 0.78, costOfLiving: 98, safety: 72, jobOpp: 68, climateRisk: 62, sectors: ['Entretenimento', 'Comércio', 'Tecnologia'] },
  { id: 'mg_bh', name: 'Belo Horizonte', state: 'Minas Gerais', ufCode: 'MG', region: 'Sudeste', tier: 'metropole', foundedYear: 1897, basePop2020: 2315000, urbanRate: 100, devIndex2020: 0.81, costOfLiving: 105, safety: 64, jobOpp: 79, climateRisk: 44, sectors: ['Tecnologia', 'Comércio', 'Saúde', 'Indústria'] },
  { id: 'mg_uberlandia', name: 'Uberlândia', state: 'Minas Gerais', ufCode: 'MG', region: 'Sudeste', tier: 'interior', foundedYear: 1888, basePop2020: 713000, urbanRate: 97, devIndex2020: 0.80, costOfLiving: 96, safety: 70, jobOpp: 77, climateRisk: 36, sectors: ['Logística', 'Agropecuária', 'Comércio', 'Tecnologia'] },
  { id: 'mg_ouropreto', name: 'Ouro Preto (Histórico)', state: 'Minas Gerais', ufCode: 'MG', region: 'Sudeste', tier: 'interior', foundedYear: 1711, basePop2020: 74000, urbanRate: 85, devIndex2020: 0.74, costOfLiving: 86, safety: 74, jobOpp: 60, climateRisk: 42, sectors: ['Educação', 'Entretenimento', 'Indústria'] },
  { id: 'es_vitoria', name: 'Vitória', state: 'Espírito Santo', ufCode: 'ES', region: 'Sudeste', tier: 'capital', foundedYear: 1551, basePop2020: 365000, urbanRate: 100, devIndex2020: 0.84, costOfLiving: 108, safety: 62, jobOpp: 75, climateRisk: 40, sectors: ['Logística', 'Energia', 'Comércio', 'Indústria'] },

  // Sul
  { id: 'pr_curitiba', name: 'Curitiba', state: 'Paraná', ufCode: 'PR', region: 'Sul', tier: 'metropole', foundedYear: 1693, basePop2020: 1773000, urbanRate: 100, devIndex2020: 0.83, costOfLiving: 104, safety: 71, jobOpp: 80, climateRisk: 42, sectors: ['Indústria', 'Tecnologia', 'Logística', 'Educação'] },
  { id: 'pr_londrina', name: 'Londrina', state: 'Paraná', ufCode: 'PR', region: 'Sul', tier: 'interior', foundedYear: 1934, basePop2020: 575000, urbanRate: 98, devIndex2020: 0.81, costOfLiving: 92, safety: 73, jobOpp: 76, climateRisk: 40, sectors: ['Agropecuária', 'Saúde', 'Educação', 'Tecnologia'] },
  { id: 'rs_poa', name: 'Porto Alegre', state: 'Rio Grande do Sul', ufCode: 'RS', region: 'Sul', tier: 'metropole', foundedYear: 1772, basePop2020: 1332000, urbanRate: 100, devIndex2020: 0.81, costOfLiving: 103, safety: 60, jobOpp: 76, climateRisk: 58, sectors: ['Comércio', 'Saúde', 'Tecnologia', 'Agropecuária'] },
  { id: 'rs_caxias', name: 'Caxias do Sul (Serra Gaúcha)', state: 'Rio Grande do Sul', ufCode: 'RS', region: 'Sul', tier: 'interior', foundedYear: 1890, basePop2020: 517000, urbanRate: 97, devIndex2020: 0.82, costOfLiving: 98, safety: 72, jobOpp: 79, climateRisk: 46, sectors: ['Indústria', 'Agropecuária', 'Comércio'] },
  { id: 'sc_florianopolis', name: 'Florianópolis', state: 'Santa Catarina', ufCode: 'SC', region: 'Sul', tier: 'capital', foundedYear: 1673, basePop2020: 537000, urbanRate: 96, devIndex2020: 0.85, costOfLiving: 110, safety: 78, jobOpp: 78, climateRisk: 46, sectors: ['Tecnologia', 'Entretenimento', 'Educação', 'Comércio'] },
  { id: 'sc_joinville', name: 'Joinville', state: 'Santa Catarina', ufCode: 'SC', region: 'Sul', tier: 'interior', foundedYear: 1851, basePop2020: 616000, urbanRate: 97, devIndex2020: 0.82, costOfLiving: 98, safety: 76, jobOpp: 81, climateRisk: 44, sectors: ['Indústria', 'Tecnologia', 'Logística'] },

  // Centro-Oeste
  { id: 'df_brasilia', name: 'Brasília', state: 'Distrito Federal', ufCode: 'DF', region: 'Centro-Oeste', tier: 'metropole', foundedYear: 1960, basePop2020: 2817000, urbanRate: 97, devIndex2020: 0.84, costOfLiving: 120, safety: 63, jobOpp: 78, climateRisk: 38, sectors: ['Educação', 'Finanças', 'Tecnologia', 'Construção'] },
  { id: 'go_goiania', name: 'Goiânia', state: 'Goiás', ufCode: 'GO', region: 'Centro-Oeste', tier: 'capital', foundedYear: 1933, basePop2020: 1437000, urbanRate: 99, devIndex2020: 0.80, costOfLiving: 95, safety: 64, jobOpp: 76, climateRisk: 40, sectors: ['Agropecuária', 'Comércio', 'Saúde', 'Construção'] },
  { id: 'go_anapolis', name: 'Anápolis (Polo Fármaco-Logístico)', state: 'Goiás', ufCode: 'GO', region: 'Centro-Oeste', tier: 'interior', foundedYear: 1907, basePop2020: 398000, urbanRate: 98, devIndex2020: 0.78, costOfLiving: 88, safety: 66, jobOpp: 75, climateRisk: 38, sectors: ['Indústria', 'Logística', 'Saúde'] },
  { id: 'mt_cuiaba', name: 'Cuiabá', state: 'Mato Grosso', ufCode: 'MT', region: 'Centro-Oeste', tier: 'capital', foundedYear: 1719, basePop2020: 650000, urbanRate: 98, devIndex2020: 0.78, costOfLiving: 96, safety: 60, jobOpp: 74, climateRisk: 54, sectors: ['Agropecuária', 'Logística', 'Comércio'] },
  { id: 'mt_sorriso', name: 'Sorriso (Capital do Agro)', state: 'Mato Grosso', ufCode: 'MT', region: 'Centro-Oeste', tier: 'rural', foundedYear: 1986, basePop2020: 110000, urbanRate: 86, devIndex2020: 0.79, costOfLiving: 88, safety: 74, jobOpp: 79, climateRisk: 46, sectors: ['Agropecuária', 'Logística'] },
  { id: 'ms_campo_grande', name: 'Campo Grande', state: 'Mato Grosso do Sul', ufCode: 'MS', region: 'Centro-Oeste', tier: 'capital', foundedYear: 1899, basePop2020: 898000, urbanRate: 98, devIndex2020: 0.79, costOfLiving: 92, safety: 66, jobOpp: 72, climateRisk: 42, sectors: ['Agropecuária', 'Comércio', 'Saúde'] },
  { id: 'ms_dourados', name: 'Dourados', state: 'Mato Grosso do Sul', ufCode: 'MS', region: 'Centro-Oeste', tier: 'interior', foundedYear: 1935, basePop2020: 243000, urbanRate: 92, devIndex2020: 0.77, costOfLiving: 84, safety: 68, jobOpp: 70, climateRisk: 44, sectors: ['Agropecuária', 'Educação', 'Comércio'] },

  // Nordeste
  { id: 'ba_salvador', name: 'Salvador', state: 'Bahia', ufCode: 'BA', region: 'Nordeste', tier: 'metropole', foundedYear: 1549, basePop2020: 2418000, urbanRate: 100, devIndex2020: 0.76, costOfLiving: 96, safety: 50, jobOpp: 70, climateRisk: 46, sectors: ['Comércio', 'Entretenimento', 'Energia', 'Saúde'] },
  { id: 'ba_feira', name: 'Feira de Santana (Princesa do Sertão)', state: 'Bahia', ufCode: 'BA', region: 'Nordeste', tier: 'interior', foundedYear: 1832, basePop2020: 619000, urbanRate: 93, devIndex2020: 0.73, costOfLiving: 82, safety: 54, jobOpp: 69, climateRisk: 52, sectors: ['Comércio', 'Logística', 'Indústria'] },
  { id: 'ce_fortaleza', name: 'Fortaleza', state: 'Ceará', ufCode: 'CE', region: 'Nordeste', tier: 'metropole', foundedYear: 1726, basePop2020: 2428000, urbanRate: 100, devIndex2020: 0.75, costOfLiving: 94, safety: 51, jobOpp: 72, climateRisk: 55, sectors: ['Comércio', 'Logística', 'Tecnologia', 'Entretenimento'] },
  { id: 'pe_recife', name: 'Recife', state: 'Pernambuco', ufCode: 'PE', region: 'Nordeste', tier: 'metropole', foundedYear: 1537, basePop2020: 1488000, urbanRate: 100, devIndex2020: 0.77, costOfLiving: 97, safety: 52, jobOpp: 74, climateRisk: 50, sectors: ['Tecnologia', 'Saúde', 'Comércio', 'Educação'] },
  { id: 'pe_petrolina', name: 'Petrolina (Vale do São Francisco)', state: 'Pernambuco', ufCode: 'PE', region: 'Nordeste', tier: 'interior', foundedYear: 1893, basePop2020: 386000, urbanRate: 78, devIndex2020: 0.72, costOfLiving: 82, safety: 62, jobOpp: 68, climateRisk: 66, sectors: ['Agropecuária', 'Comércio', 'Energia'] },
  { id: 'ma_sao_luis', name: 'São Luís', state: 'Maranhão', ufCode: 'MA', region: 'Nordeste', tier: 'capital', foundedYear: 1612, basePop2020: 1037000, urbanRate: 95, devIndex2020: 0.76, costOfLiving: 88, safety: 54, jobOpp: 66, climateRisk: 46, sectors: ['Logística', 'Indústria', 'Comércio'] },
  { id: 'pb_joao_pessoa', name: 'João Pessoa', state: 'Paraíba', ufCode: 'PB', region: 'Nordeste', tier: 'capital', foundedYear: 1585, basePop2020: 833000, urbanRate: 99, devIndex2020: 0.77, costOfLiving: 89, safety: 61, jobOpp: 67, climateRisk: 42, sectors: ['Comércio', 'Entretenimento', 'Educação'] },
  { id: 'rn_natal', name: 'Natal', state: 'Rio Grande do Norte', ufCode: 'RN', region: 'Nordeste', tier: 'capital', foundedYear: 1599, basePop2020: 751000, urbanRate: 100, devIndex2020: 0.76, costOfLiving: 88, safety: 55, jobOpp: 67, climateRisk: 48, sectors: ['Energia', 'Entretenimento', 'Comércio'] },
  { id: 'al_maceio', name: 'Maceió', state: 'Alagoas', ufCode: 'AL', region: 'Nordeste', tier: 'capital', foundedYear: 1815, basePop2020: 957000, urbanRate: 99, devIndex2020: 0.74, costOfLiving: 87, safety: 53, jobOpp: 64, climateRisk: 46, sectors: ['Comércio', 'Entretenimento', 'Indústria'] },
  { id: 'pi_teresina', name: 'Teresina', state: 'Piauí', ufCode: 'PI', region: 'Nordeste', tier: 'capital', foundedYear: 1852, basePop2020: 866000, urbanRate: 94, devIndex2020: 0.75, costOfLiving: 84, safety: 59, jobOpp: 65, climateRisk: 60, sectors: ['Saúde', 'Comércio', 'Educação', 'Energia'] },
  { id: 'se_aracaju', name: 'Aracaju', state: 'Sergipe', ufCode: 'SE', region: 'Nordeste', tier: 'capital', foundedYear: 1855, basePop2020: 602000, urbanRate: 100, devIndex2020: 0.77, costOfLiving: 87, safety: 58, jobOpp: 66, climateRisk: 44, sectors: ['Energia', 'Comércio', 'Saúde'] },

  // Norte
  { id: 'am_manaus', name: 'Manaus', state: 'Amazonas', ufCode: 'AM', region: 'Norte', tier: 'metropole', foundedYear: 1669, basePop2020: 2063000, urbanRate: 99, devIndex2020: 0.74, costOfLiving: 95, safety: 53, jobOpp: 71, climateRisk: 52, sectors: ['Indústria', 'Logística', 'Energia', 'Comércio'] },
  { id: 'pa_belem', name: 'Belém', state: 'Pará', ufCode: 'PA', region: 'Norte', tier: 'metropole', foundedYear: 1616, basePop2020: 1303000, urbanRate: 99, devIndex2020: 0.75, costOfLiving: 92, safety: 51, jobOpp: 67, climateRisk: 54, sectors: ['Logística', 'Comércio', 'Energia', 'Agropecuária'] },
  { id: 'pa_santarem', name: 'Santarém', state: 'Pará', ufCode: 'PA', region: 'Norte', tier: 'interior', foundedYear: 1661, basePop2020: 308000, urbanRate: 76, devIndex2020: 0.71, costOfLiving: 82, safety: 60, jobOpp: 63, climateRisk: 58, sectors: ['Logística', 'Agropecuária', 'Entretenimento'] },
  { id: 'ro_porto_velho', name: 'Porto Velho', state: 'Rondônia', ufCode: 'RO', region: 'Norte', tier: 'capital', foundedYear: 1914, basePop2020: 460000, urbanRate: 92, devIndex2020: 0.73, costOfLiving: 88, safety: 56, jobOpp: 66, climateRisk: 54, sectors: ['Energia', 'Agropecuária', 'Logística'] },
  { id: 'to_palmas', name: 'Palmas', state: 'Tocantins', ufCode: 'TO', region: 'Norte', tier: 'capital', foundedYear: 1989, basePop2020: 302000, urbanRate: 97, devIndex2020: 0.79, costOfLiving: 90, safety: 68, jobOpp: 70, climateRisk: 48, sectors: ['Agropecuária', 'Educação', 'Comércio'] },
  { id: 'ac_rio_branco', name: 'Rio Branco', state: 'Acre', ufCode: 'AC', region: 'Norte', tier: 'capital', foundedYear: 1882, basePop2020: 364000, urbanRate: 92, devIndex2020: 0.73, costOfLiving: 86, safety: 57, jobOpp: 62, climateRisk: 56, sectors: ['Comércio', 'Agropecuária'] },
  { id: 'ap_macapa', name: 'Macapá', state: 'Amapá', ufCode: 'AP', region: 'Norte', tier: 'capital', foundedYear: 1758, basePop2020: 442000, urbanRate: 95, devIndex2020: 0.73, costOfLiving: 88, safety: 55, jobOpp: 62, climateRisk: 50, sectors: ['Comércio', 'Logística'] },
  { id: 'rr_boa_vista', name: 'Boa Vista', state: 'Roraima', ufCode: 'RR', region: 'Norte', tier: 'capital', foundedYear: 1890, basePop2020: 413000, urbanRate: 98, devIndex2020: 0.75, costOfLiving: 89, safety: 60, jobOpp: 64, climateRisk: 48, sectors: ['Comércio', 'Agropecuária'] },
];

export interface CountrySeed {
  id: string;
  name: string;
  region: string;
  capital: string;
  language: string;
  currencyCode: string;
  bloc: CountryState['bloc'];
  basePop2020: number;
  baseGdp2020: number;
  birthRate: number;
  deathRate: number;
  migration: number;
  urban2020: number;
  diplomacyBrazil: number;
  majorCities: string[];
}

export const GLOBAL_COUNTRY_SEEDS: CountrySeed[] = [
  // Américas
  { id: 'BRA', name: 'Brasil', region: 'América do Sul', capital: 'Brasília', language: 'Português', currencyCode: 'BRL', bloc: 'América Latina / Mercosul', basePop2020: 211000000, baseGdp2020: 1476, birthRate: 13.4, deathRate: 6.9, migration: -0.2, urban2020: 87, diplomacyBrazil: 100, majorCities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Belo Horizonte', 'Curitiba'] },
  { id: 'USA', name: 'Estados Unidos', region: 'América do Norte', capital: 'Washington, D.C.', language: 'Inglês', currencyCode: 'USD', bloc: 'América do Norte', basePop2020: 331500000, baseGdp2020: 21060, birthRate: 11.1, deathRate: 9.2, migration: 2.9, urban2020: 83, diplomacyBrazil: 62, majorCities: ['Nova York', 'Los Angeles', 'Chicago', 'Houston'] },
  { id: 'CAN', name: 'Canadá', region: 'América do Norte', capital: 'Ottawa', language: 'Inglês / Francês', currencyCode: 'CAD', bloc: 'América do Norte', basePop2020: 38000000, baseGdp2020: 1645, birthRate: 10.0, deathRate: 7.9, migration: 6.2, urban2020: 82, diplomacyBrazil: 70, majorCities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary'] },
  { id: 'ARG', name: 'Argentina', region: 'América do Sul', capital: 'Buenos Aires', language: 'Espanhol', currencyCode: 'ARS', bloc: 'América Latina / Mercosul', basePop2020: 45376000, baseGdp2020: 389, birthRate: 14.2, deathRate: 7.7, migration: 0.1, urban2020: 92, diplomacyBrazil: 76, majorCities: ['Buenos Aires', 'Córdoba', 'Rosário', 'Mendoza'] },
  { id: 'MEX', name: 'México', region: 'América do Norte', capital: 'Cidade do México', language: 'Espanhol', currencyCode: 'MXN', bloc: 'América Latina / Mercosul', basePop2020: 126000000, baseGdp2020: 1090, birthRate: 15.1, deathRate: 6.8, migration: -0.9, urban2020: 81, diplomacyBrazil: 67, majorCities: ['Cidade do México', 'Monterrey', 'Guadalajara', 'Puebla'] },
  { id: 'COL', name: 'Colômbia', region: 'América do Sul', capital: 'Bogotá', language: 'Espanhol', currencyCode: 'COP', bloc: 'América Latina / Mercosul', basePop2020: 50880000, baseGdp2020: 271, birthRate: 14.5, deathRate: 6.5, migration: 0.8, urban2020: 81, diplomacyBrazil: 72, majorCities: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'] },
  { id: 'CHL', name: 'Chile', region: 'América do Sul', capital: 'Santiago', language: 'Espanhol', currencyCode: 'CLP', bloc: 'América Latina / Mercosul', basePop2020: 19120000, baseGdp2020: 252, birthRate: 11.8, deathRate: 6.4, migration: 1.8, urban2020: 88, diplomacyBrazil: 75, majorCities: ['Santiago', 'Valparaíso', 'Concepción'] },

  // Europa
  { id: 'PRT', name: 'Portugal', region: 'Europa Ocidental', capital: 'Lisboa', language: 'Português', currencyCode: 'EUR', bloc: 'União Europeia / Europa', basePop2020: 10297000, baseGdp2020: 229, birthRate: 8.2, deathRate: 11.9, migration: 3.1, urban2020: 66, diplomacyBrazil: 88, majorCities: ['Lisboa', 'Porto', 'Braga', 'Coimbra'] },
  { id: 'DEU', name: 'Alemanha', region: 'Europa Central', capital: 'Berlim', language: 'Alemão', currencyCode: 'EUR', bloc: 'União Europeia / Europa', basePop2020: 83160000, baseGdp2020: 3890, birthRate: 9.3, deathRate: 11.9, migration: 3.4, urban2020: 78, diplomacyBrazil: 66, majorCities: ['Berlim', 'Munique', 'Frankfurt', 'Hamburgo'] },
  { id: 'GBR', name: 'Reino Unido', region: 'Europa Ocidental', capital: 'Londres', language: 'Inglês', currencyCode: 'GBP', bloc: 'União Europeia / Europa', basePop2020: 67080000, baseGdp2020: 2704, birthRate: 10.1, deathRate: 9.4, migration: 3.2, urban2020: 84, diplomacyBrazil: 60, majorCities: ['Londres', 'Manchester', 'Birmingham', 'Edimburgo'] },
  { id: 'FRA', name: 'França', region: 'Europa Ocidental', capital: 'Paris', language: 'Francês', currencyCode: 'EUR', bloc: 'União Europeia / Europa', basePop2020: 67570000, baseGdp2020: 2639, birthRate: 10.9, deathRate: 9.5, migration: 1.5, urban2020: 81, diplomacyBrazil: 58, majorCities: ['Paris', 'Lyon', 'Marselha', 'Toulouse'] },
  { id: 'ITA', name: 'Itália', region: 'Europa Meridional', capital: 'Roma', language: 'Italiano', currencyCode: 'EUR', bloc: 'União Europeia / Europa', basePop2020: 59550000, baseGdp2020: 1892, birthRate: 7.0, deathRate: 12.5, migration: 2.2, urban2020: 71, diplomacyBrazil: 74, majorCities: ['Roma', 'Milão', 'Nápoles', 'Turim'] },
  { id: 'ESP', name: 'Espanha', region: 'Europa Meridional', capital: 'Madri', language: 'Espanhol', currencyCode: 'EUR', bloc: 'União Europeia / Europa', basePop2020: 47350000, baseGdp2020: 1281, birthRate: 7.6, deathRate: 10.4, migration: 4.1, urban2020: 81, diplomacyBrazil: 72, majorCities: ['Madri', 'Barcelona', 'Valência', 'Sevilha'] },
  { id: 'RUS', name: 'Rússia', region: 'Leste Europeu / Eurásia', capital: 'Moscou', language: 'Russo', currencyCode: 'RUB', bloc: 'Não Alinhado / Em Transição', basePop2020: 144100000, baseGdp2020: 1483, birthRate: 9.8, deathRate: 14.6, migration: 0.8, urban2020: 75, diplomacyBrazil: 54, majorCities: ['Moscou', 'São Petersburgo', 'Novosibirsk', 'Ecaterimburgo'] },

  // Ásia-Pacífico
  { id: 'CHN', name: 'China', region: 'Ásia Oriental', capital: 'Pequim', language: 'Mandarim', currencyCode: 'CNY', bloc: 'Ásia-Pacífico', basePop2020: 1411000000, baseGdp2020: 14688, birthRate: 8.5, deathRate: 7.3, migration: -0.2, urban2020: 62, diplomacyBrazil: 68, majorCities: ['Xangai', 'Pequim', 'Shenzhen', 'Cantão'] },
  { id: 'JPN', name: 'Japão', region: 'Ásia Oriental', capital: 'Tóquio', language: 'Japonês', currencyCode: 'JPY', bloc: 'Ásia-Pacífico', basePop2020: 126260000, baseGdp2020: 5040, birthRate: 6.8, deathRate: 11.1, migration: 0.6, urban2020: 92, diplomacyBrazil: 74, majorCities: ['Tóquio', 'Osaka', 'Yokohama', 'Nagoya'] },
  { id: 'IND', name: 'Índia', region: 'Ásia Meridional', capital: 'Nova Délhi', language: 'Hindi / Inglês', currencyCode: 'INR', bloc: 'Ásia-Pacífico', basePop2020: 1396000000, baseGdp2020: 2671, birthRate: 17.4, deathRate: 7.3, migration: -0.4, urban2020: 35, diplomacyBrazil: 70, majorCities: ['Mumbai', 'Nova Délhi', 'Bengaluru', 'Hyderabad'] },
  { id: 'KOR', name: 'Coreia do Sul', region: 'Ásia Oriental', capital: 'Seul', language: 'Coreano', currencyCode: 'KRW', bloc: 'Ásia-Pacífico', basePop2020: 51780000, baseGdp2020: 1644, birthRate: 5.9, deathRate: 6.0, migration: 1.1, urban2020: 81, diplomacyBrazil: 66, majorCities: ['Seul', 'Busan', 'Incheon', 'Daegu'] },
  { id: 'AUS', name: 'Austrália', region: 'Oceania', capital: 'Camberra', language: 'Inglês', currencyCode: 'AUD', bloc: 'Ásia-Pacífico', basePop2020: 25690000, baseGdp2020: 1331, birthRate: 11.5, deathRate: 6.7, migration: 5.8, urban2020: 86, diplomacyBrazil: 64, majorCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'] },

  // África e Oriente Médio
  { id: 'NGA', name: 'Nigéria', region: 'África Ocidental', capital: 'Abuja', language: 'Inglês', currencyCode: 'NGN', bloc: 'Oriente Médio / África', basePop2020: 208300000, baseGdp2020: 432, birthRate: 36.8, deathRate: 12.8, migration: -0.3, urban2020: 52, diplomacyBrazil: 63, majorCities: ['Lagos', 'Abuja', 'Kano', 'Ibadan'] },
  { id: 'ZAF', name: 'África do Sul', region: 'África Austral', capital: 'Pretória', language: 'Inglês / Zúlu / Africâner', currencyCode: 'ZAR', bloc: 'Oriente Médio / África', basePop2020: 59310000, baseGdp2020: 335, birthRate: 19.8, deathRate: 9.4, migration: 2.1, urban2020: 67, diplomacyBrazil: 69, majorCities: ['Joanesburgo', 'Cidade do Cabo', 'Durban', 'Pretória'] },
  { id: 'EGY', name: 'Egito', region: 'Norte da África', capital: 'Cairo', language: 'Árabe', currencyCode: 'EGP', bloc: 'Oriente Médio / África', basePop2020: 102330000, baseGdp2020: 363, birthRate: 23.4, deathRate: 5.9, migration: -0.4, urban2020: 43, diplomacyBrazil: 61, majorCities: ['Cairo', 'Alexandria', 'Gizé', 'Port Said'] },
];

export const HISTORICAL_TREATIES: InternationalTreatyRecord[] = [
  {
    id: 'treaty_antartica_1959',
    title: 'Tratado da Antártica',
    type: 'ciencia',
    countries: ['BRA', 'USA', 'RUS', 'GBR', 'FRA', 'ARG', 'CHL', 'AUS'],
    startYear: 1959,
    impactSummary: 'Desmilitarização e liberdade de pesquisa científica polar compartilhada.',
  },
  {
    id: 'treaty_tlatelolco_1967',
    title: 'Tratado de Tlatelolco (Desnuclearização da América Latina)',
    type: 'seguranca',
    countries: ['BRA', 'ARG', 'MEX', 'COL', 'CHL'],
    startYear: 1967,
    impactSummary: 'Zona livre de armas nucleares na América Latina e Caribe.',
  },
  {
    id: 'treaty_mercosul_1991',
    title: 'Tratado de Assunção (Mercosul)',
    type: 'comercio',
    countries: ['BRA', 'ARG'],
    startYear: 1991,
    impactSummary: 'Criação do Mercado Comum do Sul, livre circulação de bens e serviços.',
  },
  {
    id: 'treaty_paris_2015',
    title: 'Acordo de Paris sobre Mudança do Clima',
    type: 'clima',
    countries: ['BRA', 'USA', 'CHN', 'DEU', 'FRA', 'GBR', 'IND', 'JPN'],
    startYear: 2015,
    impactSummary: 'Compromissos globais de redução de emissões e descarbonização da economia.',
  },
  {
    id: 'treaty_artemis_2030',
    title: 'Acordo Artemis e Exploração Espacial Pacífica',
    type: 'ciencia',
    countries: ['BRA', 'USA', 'CAN', 'JPN', 'FRA', 'GBR', 'AUS'],
    startYear: 2030,
    impactSummary: 'Exploração cooperativa da Lua e asteroides com compartilhamento tecnológico.',
  },
  {
    id: 'treaty_alianca_solar_2045',
    title: 'Aliança Solar e Transição Energética Continental',
    type: 'clima',
    countries: ['BRA', 'ARG', 'CHL', 'COL', 'MEX', 'DEU'],
    startYear: 2045,
    impactSummary: 'Rede transcontinental de energia limpa e precificação do carbono.',
  },
  {
    id: 'treaty_governanca_ia_2065',
    title: 'Pacto Global de Governança de Inteligência Artificial & Quântica',
    type: 'seguranca',
    countries: ['BRA', 'USA', 'CHN', 'DEU', 'IND', 'JPN', 'KOR'],
    startYear: 2065,
    impactSummary: 'Salvaguardas éticas contra autonomia bélica e garantia de alinhamento sintético.',
  },
  {
    id: 'treaty_sustentabilidade_2100',
    title: 'Tratado da Biosfera Terrestre e Estabilidade Planetária',
    type: 'clima',
    countries: ['BRA', 'USA', 'CHN', 'IND', 'DEU', 'FRA', 'RUS', 'NGA'],
    startYear: 2100,
    impactSummary: 'Gestão ecossistêmica vinculante para refrigeração climática e restauração florestal.',
  },
];

export const HISTORICAL_CONFLICTS: InternationalConflictRecord[] = [
  {
    id: 'conflict_ww1',
    title: 'Primeira Guerra Mundial',
    belligerents: ['DEU', 'GBR', 'FRA', 'RUS', 'USA', 'BRA'],
    startYear: 1914,
    endYear: 1918,
    intensity: 'Guerra Global',
    impactSummary: 'Conflito massivo nas frentes europeias; Brasil participou patrulhando o Atlântico e com missões médicas.',
  },
  {
    id: 'conflict_ww2',
    title: 'Segunda Guerra Mundial',
    belligerents: ['DEU', 'ITA', 'JPN', 'USA', 'GBR', 'RUS', 'FRA', 'BRA'],
    startYear: 1939,
    endYear: 1945,
    intensity: 'Guerra Global',
    impactSummary: 'Força Expedicionária Brasileira (FEB) lutou na Itália; consolidação do complexo siderúrgico de Volta Redonda.',
  },
  {
    id: 'conflict_cold_war',
    title: 'Guerra Fria e Tensões Bipolares',
    belligerents: ['USA', 'RUS', 'CHN'],
    startYear: 1947,
    endYear: 1991,
    intensity: 'Tensão',
    impactSummary: 'Disputa ideológica global, corrida espacial, corrida armamentista e pressões geopolíticas na América Latina.',
  },
  {
    id: 'conflict_malvinas_1982',
    title: 'Guerra das Malvinas / Falklands',
    belligerents: ['ARG', 'GBR'],
    startYear: 1982,
    endYear: 1982,
    intensity: 'Guerra Regional',
    impactSummary: 'Confronto aeronaval no Atlântico Sul, crise na ditadura argentina e neutralidade vigilante brasileira.',
  },
  {
    id: 'conflict_orbital_cyber_2038',
    title: 'Crise de Cibersegurança e Telecomunicações Orbitais',
    belligerents: ['USA', 'CHN', 'RUS'],
    startYear: 2038,
    endYear: 2043,
    intensity: 'Tensão',
    impactSummary: 'Interrupções transitórias em satélites de posicionamento e telecomunicações civis globais.',
  },
  {
    id: 'conflict_water_scarcity_2068',
    title: 'Tensões Regionais sobre Recursos Hídricos Globais',
    belligerents: ['EGY', 'NGA', 'IND'],
    startYear: 2068,
    endYear: 2074,
    intensity: 'Guerra Regional',
    impactSummary: 'Disputas territoriais sobre bacias fluviais sob severo estresse hídrico; valorização da água e do agro brasileiro.',
  },
];

function historicalPopulationScaleFactor(year: number): number {
  if (year <= 1500) return 0.06;
  if (year <= 1800) return 0.12;
  if (year <= 1900) return 0.22;
  if (year <= 1950) return 0.34 + ((year - 1900) / 50) * 0.14;
  if (year <= 1980) return 0.48 + ((year - 1950) / 30) * 0.20;
  if (year <= 2000) return 0.68 + ((year - 1980) / 20) * 0.16;
  if (year <= 2020) return 0.84 + ((year - 2000) / 20) * 0.16;
  return 1.0 + Math.min(0.45, (year - 2020) * 0.004);
}

function historicalGdpScaleFactor(year: number): number {
  if (year <= 1850) return 0.03;
  if (year <= 1900) return 0.06;
  if (year <= 1950) return 0.12 + ((year - 1900) / 50) * 0.12;
  if (year <= 1980) return 0.24 + ((year - 1950) / 30) * 0.24;
  if (year <= 2000) return 0.48 + ((year - 1980) / 20) * 0.24;
  if (year <= 2020) return 0.72 + ((year - 2000) / 20) * 0.28;
  return 1.0 + Math.min(6.0, (year - 2020) * 0.022);
}

export class WorldGeographyEngine {
  static getActiveTreaties(year: number): InternationalTreatyRecord[] {
    return HISTORICAL_TREATIES.filter(
      (t) => year >= t.startYear && (t.endYear === undefined || year <= t.endYear)
    );
  }

  static getActiveConflicts(year: number): InternationalConflictRecord[] {
    return HISTORICAL_CONFLICTS.filter(
      (c) => year >= c.startYear && (c.endYear === undefined || year <= c.endYear)
    );
  }

  static buildBrazilianCities(year: number): Record<string, CityEvolutionMetrics> {
    const scalePop = historicalPopulationScaleFactor(year);
    const devScale = Math.min(1, Math.max(0.35, (year - 1880) / 145));
    const cities: Record<string, CityEvolutionMetrics> = {};

    for (const seed of BRAZIL_CITY_SEEDS) {
      const effectiveScale = year < seed.foundedYear ? 0.03 : scalePop;
      const capitalChanged = seed.id === 'df_brasilia' && year < 1960;
      const urban = Math.max(12, Math.min(100, Math.round(seed.urbanRate * (0.38 + 0.62 * devScale))));
      const dev = Number(Math.min(0.95, Math.max(0.28, seed.devIndex2020 * (0.45 + 0.55 * devScale))).toFixed(3));
      const pop = capitalChanged ? 5000 : Math.max(4500, Math.round(seed.basePop2020 * effectiveScale));

      cities[seed.id] = {
        id: seed.id,
        name: seed.name,
        state: seed.state,
        ufCode: seed.ufCode,
        region: seed.region,
        tier: seed.tier,
        countryId: 'BRA',
        foundedYear: seed.foundedYear,
        population: pop,
        urbanizationRate: urban,
        developmentIndex: dev,
        costOfLivingIndex: Math.round(seed.costOfLiving * (0.65 + 0.35 * devScale)),
        safetyIndex: seed.safety,
        jobOpportunityIndex: Math.round(seed.jobOpp * (0.55 + 0.45 * devScale)),
        infrastructureLevel: Math.round(urban * 0.85),
        climateRiskIndex: seed.climateRisk,
        mainSectors: seed.sectors,
      };
    }
    return cities;
  }

  static advanceCitiesYear(
    cities: Record<string, CityEvolutionMetrics>,
    year: number,
    gdpGrowth: number
  ): Record<string, CityEvolutionMetrics> {
    const updated: Record<string, CityEvolutionMetrics> = {};
    const growthFactor = 1 + (gdpGrowth / 100) * 0.25;

    for (const [id, c] of Object.entries(cities)) {
      // Natural municipal pop evolution (births - deaths + migration attraction)
      const popGrowth = year >= c.foundedYear ? (0.005 + (c.jobOpportunityIndex - 50) * 0.0002) : 0.001;
      const newPop = Math.round(c.population * (1 + popGrowth));
      const newDev = Number(Math.min(0.98, Math.max(0.25, c.developmentIndex * (1 + (gdpGrowth > 0 ? 0.0015 : -0.001)))).toFixed(3));
      const newCost = Math.round(Math.min(220, Math.max(50, c.costOfLivingIndex * (1 + (gdpGrowth > 1 ? 0.008 : -0.004)))));
      const newJob = Math.round(Math.min(99, Math.max(20, c.jobOpportunityIndex * growthFactor)));
      const newInfra = Math.round(Math.min(99, Math.max(15, c.infrastructureLevel + (gdpGrowth > 2 ? 0.4 : 0))));

      updated[id] = {
        ...c,
        population: newPop,
        developmentIndex: newDev,
        costOfLivingIndex: newCost,
        jobOpportunityIndex: newJob,
        infrastructureLevel: newInfra,
      };
    }
    return updated;
  }

  static buildCountries(year: number): Record<string, CountryState> {
    const popScale = historicalPopulationScaleFactor(year);
    const gdpScale = historicalGdpScaleFactor(year);
    const devScale = Math.min(1, Math.max(0.25, (year - 1880) / 145));
    const activeConflicts = this.getActiveConflicts(year);
    const result: Record<string, CountryState> = {};

    for (const c of GLOBAL_COUNTRY_SEEDS) {
      const capitalName = c.id === 'BRA' && year < 1960 ? 'Rio de Janeiro' : c.capital;
      const regimeType = this.resolveCountryRegime(c.id, year);
      const lifeExp = Math.round(Math.min(88, Math.max(34, 42 + 36 * devScale + (c.id === 'JPN' ? 6 : c.id === 'NGA' ? -14 : 0))));
      const urban = Math.round(Math.min(98, Math.max(15, c.urban2020 * (0.4 + 0.6 * devScale))));
      const techAdopt = Math.round(Math.min(99, Math.max(4, (year < 1950 ? 12 : year < 1995 ? 38 : 74) * (c.id === 'USA' || c.id === 'JPN' ? 1.15 : c.id === 'NGA' ? 0.68 : 0.95))));

      const involvedInWar = activeConflicts.find((cf) => cf.belligerents.includes(c.id));
      let conflictStatus: CountryState['conflictStatus'] = 'Paz';
      if (involvedInWar) {
        conflictStatus = involvedInWar.intensity === 'Tensão' ? 'Tensão Diplomática' : 'Conflito Regional';
      }

      result[c.id] = {
        id: c.id,
        name: c.name,
        region: c.region,
        capital: capitalName,
        language: c.language,
        currencyCode: c.id === 'BRA' && year < 1994 ? 'CR$' : c.currencyCode,
        bloc: c.bloc,
        regimeType,
        diplomaticRelationWithBrazil: c.diplomacyBrazil,
        population: Math.round(c.basePop2020 * popScale),
        birthRatePer1000: Number((c.birthRate + (year < 1980 ? 10 : 0)).toFixed(1)),
        deathRatePer1000: Number((c.deathRate + (year < 1960 ? 6 : 0)).toFixed(1)),
        netMigrationPer1000: c.migration,
        urbanizationRate: urban,
        gdpBillionsUSD: Number((c.baseGdp2020 * gdpScale).toFixed(1)),
        gdpGrowthRate: c.id === 'CHN' && year >= 1980 && year <= 2015 ? 8.5 : 2.6,
        inflationRate: c.id === 'ARG' && year >= 2018 ? 68 : 3.8,
        unemploymentRate: c.id === 'BRA' ? 8.2 : 5.5,
        interestRate: c.id === 'BRA' ? 10.5 : 4.2,
        techAdoptionIndex: techAdopt,
        stabilityIndex: c.id === 'ARG' ? 60 : c.id === 'NGA' ? 54 : 76,
        lifeExpectancy: lifeExp,
        conflictStatus,
        majorCities: c.majorCities,
      };
    }
    return result;
  }

  static resolveCountryRegime(countryId: string, year: number): string {
    if (countryId === 'BRA') {
      if (year < 1822) return 'Colônia Portuguesa';
      if (year < 1889) return 'Monarquia Constitucional';
      if (year < 1930) return 'República Oligárquica';
      if (year < 1945) return 'Governo Vargas';
      if (year < 1964) return 'República Democrática';
      if (year < 1985) return 'Regime Militar';
      return 'República Federativa Presidencialista';
    }
    if (countryId === 'CHN') {
      if (year < 1912) return 'Império Qing';
      if (year < 1949) return 'República da China';
      return 'República Popular Socialista';
    }
    if (countryId === 'PRT') {
      if (year < 1910) return 'Monarquia Constitucional';
      if (year >= 1933 && year <= 1974) return 'Estado Novo (Autoritário)';
      return 'República Parlamentar/Semipresidencialista';
    }
    if (countryId === 'DEU') {
      if (year < 1918) return 'Império Alemão';
      if (year < 1933) return 'República de Weimar';
      if (year < 1945) return 'Regime Totalitário';
      if (year < 1990) return 'Alemanha Dividida (Ocidental/Oriental)';
      return 'República Federal Parlamentarista';
    }
    if (countryId === 'ITA') {
      if (year < 1861) return 'Ducados e Reinos Peninsulares';
      if (year < 1922) return 'Reino da Itália (Monarquia)';
      if (year < 1943) return 'Regime Fascista';
      return 'República Parlamentar';
    }
    if (countryId === 'ESP') {
      if (year < 1931) return 'Reino da Espanha';
      if (year < 1939) return 'Segunda República';
      if (year < 1975) return 'Franquismo (Ditadura)';
      return 'Monarquia Parlamentarista';
    }
    if (countryId === 'RUS') {
      if (year < 1917) return 'Império Russo';
      if (year < 1991) return 'União Soviética (URSS)';
      return 'Federação Semipresidencialista';
    }
    if (countryId === 'CAN') return 'Monarquia Constitucional Federal';
    if (countryId === 'AUS') return 'Monarquia Constitucional Federal';
    if (countryId === 'COL') return 'República Presidencialista';
    if (countryId === 'CHL') {
      if (year >= 1973 && year <= 1990) return 'Regime Militar';
      return 'República Democrática Presidencialista';
    }
    if (countryId === 'KOR') {
      if (year < 1948) return 'Administração Pós-Guerra';
      if (year < 1987) return 'República Autoritária Desenvolvimentista';
      return 'República Democrática Presidencialista';
    }
    if (countryId === 'ZAF') {
      if (year < 1994) return 'Regime do Apartheid';
      return 'República Constitucional Parlamentar';
    }
    if (countryId === 'EGY') {
      if (year < 1952) return 'Reino do Egito (Protetorado Britânico)';
      return 'República Semipresidencialista';
    }
    if (countryId === 'ARG') {
      if (year >= 1976 && year <= 1983) return 'Regime Militar';
      return 'República Presidencialista';
    }
    if (countryId === 'GBR') return 'Monarquia Parlamentarista';
    if (countryId === 'JPN') return year < 1947 ? 'Império do Japão' : 'Monarquia Constitucional Parlamentarista';
    if (countryId === 'IND') return year < 1947 ? 'Domínio Colonial Britânico' : 'República Federal Parlamentarista';
    if (countryId === 'NGA') return year < 1960 ? 'Colônia Britânica' : 'República Federal Presidencialista';
    return 'República Presidencialista';
  }

  static getCityOptionsForCharacterCreation(): { state: string; cities: string[] }[] {
    const grouped: Record<string, string[]> = {};
    for (const c of BRAZIL_CITY_SEEDS) {
      if (!grouped[c.state]) grouped[c.state] = [];
      grouped[c.state].push(c.name);
    }
    return Object.entries(grouped).map(([state, cities]) => ({ state, cities }));
  }

  static findStateByNameOrCode(query: string): BrazilStateInfo | undefined {
    const q = query.trim().toLowerCase();
    return BRAZIL_STATES.find((s) => s.name.toLowerCase() === q || s.code.toLowerCase() === q);
  }
}
