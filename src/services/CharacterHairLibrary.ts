export type HairCategory =
  | 'careca'
  | 'curto'
  | 'medio'
  | 'longo'
  | 'crespo'
  | 'cacheado'
  | 'ondulado'
  | 'liso'
  | 'entradas';

export interface HairStyleDef {
  id: string;
  label: string;
  category: HairCategory;
  genderHint?: 'M' | 'F' | 'U';
  backPath?: string;
  frontPath: string;
  accentPaths?: string[]; // subtle hair partings or curl details
}

export interface HairColorDef {
  id: string;
  label: string;
  base: string;
  highlight: string;
  shadow: string;
}

export const HAIR_COLORS: HairColorDef[] = [
  { id: 'preto', label: 'Preto', base: '#1E1B18', highlight: '#3A3530', shadow: '#0D0B0A' },
  { id: 'castanho_escuro', label: 'Castanho Escuro', base: '#3B281E', highlight: '#593E30', shadow: '#221610' },
  { id: 'castanho_medio', label: 'Castanho Médio', base: '#63412C', highlight: '#84593E', shadow: '#42291A' },
  { id: 'castanho_claro', label: 'Castanho Claro', base: '#8B6242', highlight: '#AE805C', shadow: '#63432B' },
  { id: 'loiro_escuro', label: 'Loiro Escuro', base: '#A67C46', highlight: '#C79B61', shadow: '#7A582C' },
  { id: 'loiro_dourado', label: 'Loiro Dourado', base: '#D6A852', highlight: '#ECC67A', shadow: '#A87E31' },
  { id: 'loiro_platinado', label: 'Loiro Platinado', base: '#E9DCBE', highlight: '#F7F0DF', shadow: '#C4B38E' },
  { id: 'ruivo_acobreado', label: 'Ruivo Acobreado', base: '#B54B27', highlight: '#D96840', shadow: '#803116' },
  { id: 'ruivo_cereja', label: 'Ruivo Intenso', base: '#962E2B', highlight: '#BA4542', shadow: '#661B19' },
  { id: 'grisalho', label: 'Grisalho', base: '#7B828C', highlight: '#A1A8B2', shadow: '#525861' },
  { id: 'prateado', label: 'Prateado', base: '#B8C0CC', highlight: '#DCE2EC', shadow: '#8992A0' },
  { id: 'branco', label: 'Branco', base: '#E2E8F0', highlight: '#F8FAFC', shadow: '#B0BAC7' },
  { id: 'azul_fashion', label: 'Azul Moderno', base: '#2563EB', highlight: '#60A5FA', shadow: '#1E3A8A' },
  { id: 'rosa_fashion', label: 'Rosa Moderno', base: '#DB2777', highlight: '#F472B6', shadow: '#9D174D' },
];

// 32 Distinct BitLife-inspired Clean Vector Hairstyles (viewBox 200x200, head ~x:56..144, y:50..154)
export const HAIR_STYLES: HairStyleDef[] = [
  // 1-3: Careca / Raspado / Fio de bebê
  {
    id: 'careca',
    label: 'Careca',
    category: 'careca',
    genderHint: 'U',
    frontPath: '',
  },
  {
    id: 'fio_bebe',
    label: 'Cachinho Único',
    category: 'curto',
    genderHint: 'U',
    frontPath: 'M 98 53 C 92 42, 108 38, 107 49 C 106 53, 101 54, 98 53 Z',
  },
  {
    id: 'raspado_militar',
    label: 'Raspado Curto',
    category: 'curto',
    genderHint: 'M',
    frontPath: 'M 57 90 C 57 60, 74 47, 100 47 C 126 47, 143 60, 143 90 C 139 74, 124 64, 100 64 C 76 64, 61 74, 57 90 Z',
  },
  // 4-9: Curtos Masculinos & Unissex
  {
    id: 'curto_social',
    label: 'Curto Social',
    category: 'curto',
    genderHint: 'M',
    frontPath: 'M 56 93 C 54 60, 72 41, 102 41 C 130 41, 146 58, 144 93 C 141 74, 126 65, 100 65 C 78 65, 62 72, 56 93 Z',
    accentPaths: ['M 76 54 Q 100 48 126 56'],
  },
  {
    id: 'curto_degrade',
    label: 'Degradê Moderno',
    category: 'curto',
    genderHint: 'M',
    frontPath: 'M 58 84 C 58 55, 73 37, 100 37 C 128 37, 142 54, 142 84 C 138 69, 125 63, 100 63 C 75 63, 62 69, 58 84 Z',
    accentPaths: ['M 68 48 Q 100 42 132 49'],
  },
  {
    id: 'topete_classico',
    label: 'Topete Clássico',
    category: 'curto',
    genderHint: 'M',
    frontPath: 'M 57 90 C 55 62, 68 42, 95 36 C 118 31, 142 42, 143 89 C 139 71, 123 64, 102 64 C 77 64, 61 73, 57 90 Z',
    accentPaths: ['M 82 47 Q 106 39 128 52'],
  },
  {
    id: 'topete_baguncado',
    label: 'Repicado Bagunçado',
    category: 'curto',
    genderHint: 'M',
    frontPath: 'M 56 92 C 53 65, 67 45, 82 42 L 88 35 L 98 41 L 110 34 L 118 42 C 135 45, 147 64, 144 92 C 138 74, 126 67, 114 68 L 106 60 L 94 68 L 84 61 C 72 67, 62 75, 56 92 Z',
  },
  {
    id: 'curto_franja_lateral',
    label: 'Curto Franja Lateral',
    category: 'liso',
    genderHint: 'U',
    frontPath: 'M 56 94 C 54 57, 73 41, 101 41 C 130 41, 146 59, 144 94 C 140 75, 127 66, 112 64 C 95 75, 73 79, 56 94 Z',
  },
  {
    id: 'moicano_estilizado',
    label: 'Moicano Estilizado',
    category: 'curto',
    genderHint: 'M',
    frontPath: 'M 83 62 C 81 36, 90 23, 100 23 C 110 23, 119 36, 117 62 C 109 59, 91 59, 83 62 Z',
    accentPaths: ['M 95 30 L 95 52', 'M 105 30 L 105 52'],
  },
  // 10-12: Entradas (Calvície Parcial / Meia-Idade / Idoso)
  {
    id: 'entradas_leves',
    label: 'Entradas Discretas',
    category: 'entradas',
    genderHint: 'M',
    frontPath: 'M 57 92 C 56 64, 71 49, 85 55 C 93 48, 107 48, 115 55 C 129 49, 144 64, 143 92 C 138 75, 126 69, 117 70 C 110 62, 90 62, 83 70 C 74 69, 62 75, 57 92 Z',
  },
  {
    id: 'entradas_acentuadas',
    label: 'Calvície Frontal',
    category: 'entradas',
    genderHint: 'M',
    frontPath: 'M 56 95 C 55 72, 62 60, 70 61 C 69 75, 65 86, 56 95 Z M 144 95 C 145 72, 138 60, 130 61 C 131 75, 135 86, 144 95 Z M 88 53 C 96 48, 104 48, 112 53 C 106 58, 94 58, 88 53 Z',
  },
  {
    id: 'coroa_calva',
    label: 'Coroa Lateral',
    category: 'entradas',
    genderHint: 'M',
    frontPath: 'M 55 102 C 53 82, 58 69, 66 69 C 66 83, 63 94, 55 102 Z M 145 102 C 147 82, 142 69, 134 69 C 134 83, 137 94, 145 102 Z',
  },
  // 13-17: Crespos & Afros
  {
    id: 'black_power_medio',
    label: 'Black Power Médio',
    category: 'crespo',
    genderHint: 'U',
    backPath: 'M 100 22 C 142 22, 165 50, 162 88 C 160 112, 146 124, 134 124 L 66 124 C 54 124, 40 112, 38 88 C 35 50, 58 22, 100 22 Z',
    frontPath: 'M 55 88 C 52 54, 70 30, 100 30 C 130 30, 148 54, 145 88 C 141 69, 126 60, 100 60 C 74 60, 59 69, 55 88 Z',
    accentPaths: ['M 72 42 Q 100 34 128 42'],
  },
  {
    id: 'black_power_volumoso',
    label: 'Black Power Volumoso',
    category: 'crespo',
    genderHint: 'U',
    backPath: 'M 100 14 C 150 14, 174 48, 170 94 C 167 122, 150 135, 136 135 L 64 135 C 50 135, 33 122, 30 94 C 26 48, 50 14, 100 14 Z',
    frontPath: 'M 54 90 C 49 52, 69 24, 100 24 C 131 24, 151 52, 146 90 C 141 68, 125 60, 100 60 C 75 60, 59 68, 54 90 Z',
  },
  {
    id: 'crespo_curto_fade',
    label: 'Crespo Baixo Taper',
    category: 'crespo',
    genderHint: 'M',
    frontPath: 'M 58 84 C 56 54, 74 36, 100 36 C 126 36, 144 54, 142 84 C 137 66, 122 59, 100 59 C 78 59, 63 66, 58 84 Z',
    accentPaths: ['M 68 48 C 76 42, 86 42, 92 46', 'M 108 46 C 114 42, 124 42, 132 48'],
  },
  {
    id: 'dreads_medios',
    label: 'Dreads Médios',
    category: 'crespo',
    genderHint: 'U',
    backPath: 'M 55 55 L 44 138 L 58 140 L 66 80 Z M 145 55 L 156 138 L 142 140 L 134 80 Z M 65 44 L 54 148 L 68 148 L 78 65 Z M 135 44 L 146 148 L 132 148 L 122 65 Z',
    frontPath: 'M 56 88 C 56 52, 74 38, 100 38 C 126 38, 144 52, 144 88 C 138 72, 127 64, 118 65 L 112 48 L 104 64 L 96 64 L 88 48 L 82 65 C 73 64, 62 72, 56 88 Z',
  },
  {
    id: 'trancas_longas',
    label: 'Tranças Box Braids',
    category: 'crespo',
    genderHint: 'F',
    backPath: 'M 52 54 L 40 165 L 55 165 L 64 78 Z M 148 54 L 160 165 L 145 165 L 136 78 Z M 66 44 L 50 172 L 66 172 L 76 66 Z M 134 44 L 150 172 L 134 172 L 124 66 Z',
    frontPath: 'M 55 92 C 55 54, 73 39, 100 39 C 127 39, 145 54, 145 92 C 138 72, 124 63, 100 63 C 76 63, 62 72, 55 92 Z',
    accentPaths: ['M 78 44 L 74 64', 'M 100 40 L 100 62', 'M 122 44 L 126 64'],
  },
  // 18-22: Cacheados
  {
    id: 'cacheado_curto',
    label: 'Cacheado Curto',
    category: 'cacheado',
    genderHint: 'U',
    frontPath: 'M 56 90 C 50 74, 54 55, 68 48 C 72 36, 90 32, 100 37 C 110 32, 128 36, 132 48 C 146 55, 150 74, 144 90 C 138 72, 125 65, 112 66 C 104 60, 96 60, 88 66 C 75 65, 62 72, 56 90 Z',
  },
  {
    id: 'cacheado_medio',
    label: 'Cacheado Médio',
    category: 'cacheado',
    genderHint: 'U',
    backPath: 'M 52 62 C 38 75, 38 112, 50 128 C 44 136, 52 150, 68 148 L 132 148 C 148 150, 156 136, 150 128 C 162 112, 162 75, 148 62 Z',
    frontPath: 'M 54 92 C 47 72, 54 48, 72 42 C 80 32, 120 32, 128 42 C 146 48, 153 72, 146 92 C 138 73, 124 65, 100 65 C 76 65, 62 73, 54 92 Z',
  },
  {
    id: 'cacheado_longo',
    label: 'Cacheado Longo',
    category: 'cacheado',
    genderHint: 'F',
    backPath: 'M 52 56 C 32 76, 32 118, 44 136 C 36 154, 42 178, 62 182 L 138 182 C 158 178, 164 154, 156 136 C 168 118, 168 76, 148 56 Z',
    frontPath: 'M 54 94 C 48 68, 59 42, 82 37 C 93 32, 107 32, 118 37 C 141 42, 152 68, 146 94 C 139 73, 125 63, 100 63 C 75 63, 61 73, 54 94 Z',
  },
  {
    id: 'puffs_duplos',
    label: 'Coques Duplos',
    category: 'cacheado',
    genderHint: 'F',
    backPath: 'M 56 46 C 40 36, 42 18, 60 22 C 72 24, 74 42, 66 52 Z M 144 46 C 160 36, 158 18, 140 22 C 128 24, 126 42, 134 52 Z',
    frontPath: 'M 56 92 C 56 56, 74 43, 100 43 C 126 43, 144 56, 144 92 C 138 71, 123 63, 100 63 C 77 63, 62 71, 56 92 Z',
    accentPaths: ['M 100 44 L 100 62'],
  },
  {
    id: 'cacheado_franja',
    label: 'Cachos com Franja',
    category: 'cacheado',
    genderHint: 'F',
    backPath: 'M 50 64 C 36 88, 38 140, 56 160 L 144 160 C 162 140, 164 88, 150 64 Z',
    frontPath: 'M 54 92 C 50 60, 68 38, 100 38 C 132 38, 150 60, 146 92 C 140 78, 132 71, 122 76 C 114 70, 106 72, 100 78 C 94 72, 86 70, 78 76 C 68 71, 60 78, 54 92 Z',
  },
  // 23-26: Ondulados
  {
    id: 'ondulado_curto',
    label: 'Ondulado Curto',
    category: 'ondulado',
    genderHint: 'U',
    frontPath: 'M 56 92 C 52 60, 68 40, 100 40 C 132 40, 148 60, 144 92 C 138 74, 124 65, 108 66 C 95 72, 74 74, 56 92 Z',
    accentPaths: ['M 74 52 Q 100 45 124 55'],
  },
  {
    id: 'ondulado_medio',
    label: 'Ondulado Médio',
    category: 'ondulado',
    genderHint: 'F',
    backPath: 'M 53 60 C 42 86, 44 128, 54 148 C 66 154, 134 154, 146 148 C 156 128, 158 86, 147 60 Z',
    frontPath: 'M 54 95 C 53 56, 72 39, 100 39 C 128 39, 147 56, 146 95 C 140 73, 124 62, 100 62 C 76 62, 60 73, 54 95 Z',
  },
  {
    id: 'ondulado_longo',
    label: 'Ondulado Longo',
    category: 'ondulado',
    genderHint: 'F',
    backPath: 'M 52 56 C 40 90, 44 126, 38 154 C 36 172, 46 184, 64 185 L 136 185 C 154 184, 164 172, 162 154 C 156 126, 160 90, 148 56 Z',
    frontPath: 'M 54 96 C 53 55, 72 38, 100 38 C 128 38, 147 55, 146 96 C 140 72, 124 62, 100 62 C 76 62, 60 72, 54 96 Z',
  },
  {
    id: 'rabo_de_cavalo',
    label: 'Rabo de Cavalo',
    category: 'ondulado',
    genderHint: 'F',
    backPath: 'M 92 46 C 118 42, 150 56, 156 106 C 158 134, 148 156, 136 164 C 134 134, 136 98, 114 74 Z',
    frontPath: 'M 56 92 C 55 56, 74 42, 100 42 C 126 42, 145 56, 144 92 C 138 71, 123 63, 100 63 C 77 63, 62 71, 56 92 Z',
  },
  // 27-32: Lisos (Chanel, Longo, Franja, Coque, Médio)
  {
    id: 'liso_chanel',
    label: 'Chanel Clássico',
    category: 'liso',
    genderHint: 'F',
    backPath: 'M 52 60 L 46 142 C 54 148, 66 150, 74 146 L 126 146 C 134 150, 146 148, 154 142 L 148 60 Z',
    frontPath: 'M 54 96 C 53 56, 72 39, 100 39 C 128 39, 147 56, 146 96 C 141 74, 127 63, 107 62 C 92 68, 72 74, 54 96 Z',
  },
  {
    id: 'liso_longo_central',
    label: 'Longo Liso Partido',
    category: 'liso',
    genderHint: 'F',
    backPath: 'M 52 54 L 44 185 L 156 185 L 148 54 Z',
    frontPath: 'M 54 98 C 53 55, 72 38, 100 38 C 128 38, 147 55, 146 98 C 141 74, 126 62, 101 61 C 100 61, 100 61, 99 61 C 74 62, 59 74, 54 98 Z',
    accentPaths: ['M 100 39 L 100 61'],
  },
  {
    id: 'liso_franja_reta',
    label: 'Longo com Franja',
    category: 'liso',
    genderHint: 'F',
    backPath: 'M 52 54 L 45 184 L 155 184 L 148 54 Z',
    frontPath: 'M 54 96 C 53 54, 72 38, 100 38 C 128 38, 147 54, 146 96 C 142 81, 134 74, 128 74 L 72 74 C 66 74, 58 81, 54 96 Z',
    accentPaths: ['M 82 60 L 80 74', 'M 118 60 L 120 74'],
  },
  {
    id: 'coque_alto',
    label: 'Coque Elegante',
    category: 'liso',
    genderHint: 'F',
    backPath: 'M 80 44 C 78 24, 90 16, 100 16 C 110 16, 122 24, 120 44 Z',
    frontPath: 'M 56 92 C 56 56, 74 42, 100 42 C 126 42, 144 56, 144 92 C 138 71, 123 63, 100 63 C 77 63, 62 71, 56 92 Z',
  },
  {
    id: 'medio_surfista',
    label: 'Médio Jogado',
    category: 'medio',
    genderHint: 'M',
    backPath: 'M 52 68 C 44 90, 46 118, 56 132 L 144 132 C 154 118, 156 90, 148 68 Z',
    frontPath: 'M 54 94 C 52 57, 71 39, 100 39 C 129 39, 148 57, 146 94 C 140 73, 125 65, 110 66 C 95 75, 72 76, 54 94 Z',
  },
  {
    id: 'medio_em_camadas',
    label: 'Médio em Camadas',
    category: 'medio',
    genderHint: 'F',
    backPath: 'M 51 62 L 42 156 C 54 164, 68 164, 74 154 L 126 154 C 132 164, 146 164, 158 156 L 149 62 Z',
    frontPath: 'M 54 96 C 53 56, 72 39, 100 39 C 128 39, 147 56, 146 96 C 140 73, 124 62, 100 62 C 76 62, 60 73, 54 96 Z',
  },
];

export function findHairStyle(id?: string): HairStyleDef {
  return HAIR_STYLES.find(h => h.id === id) || HAIR_STYLES[3];
}

export function findHairColor(id?: string): HairColorDef {
  return HAIR_COLORS.find(c => c.id === id) || HAIR_COLORS[1];
}
