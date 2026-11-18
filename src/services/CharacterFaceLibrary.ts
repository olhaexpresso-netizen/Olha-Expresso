export interface FaceShapeDef {
  id: string;
  label: string;
  path: string;
  earOffsetX: number;
  earOffsetY: number;
  jawWidthFactor: number;
  chinY: number;
}

export interface SkinToneDef {
  id: string;
  label: string;
  base: string;
  shadow: string;
  highlight: string;
  blush: string;
  lipBase: string;
  outline: string;
}

export interface EyeStyleDef {
  id: string;
  label: string;
  rx: number;
  ry: number;
  irisRadius: number;
  pupilRadius: number;
  tiltDeg: number;
  lashStyle: 'none' | 'subtle' | 'winged' | 'thick';
}

export interface EyeColorDef {
  id: string;
  label: string;
  hex: string;
  ringHex: string;
}

export interface EyebrowStyleDef {
  id: string;
  label: string;
  thickness: number;
  arch: number;
  length: number;
  style: 'natural' | 'arched' | 'straight' | 'thick' | 'thin' | 'curved' | 'angular' | 'bushy';
}

export interface NoseStyleDef {
  id: string;
  label: string;
  width: number;
  height: number;
  type: 'pequeno' | 'medio' | 'largo' | 'fino' | 'arredondado' | 'aquilino';
}

export interface MouthStyleDef {
  id: string;
  label: string;
  width: number;
  lipFullness: number;
  cupidsBow: number;
}

export interface FacialHairDef {
  id: string;
  label: string;
  type: 'none' | 'stubble' | 'goatee' | 'trimmed' | 'full' | 'lumberjack' | 'chinstrap';
}

export interface MustacheDef {
  id: string;
  label: string;
  type: 'none' | 'thin' | 'classic' | 'thick' | 'handlebar';
}

export interface GlassesDef {
  id: string;
  label: string;
  type: 'none' | 'round' | 'square' | 'aviator' | 'cateye' | 'half' | 'sunglasses';
  frameColor: string;
}

export interface EarringDef {
  id: string;
  label: string;
  type: 'none' | 'stud' | 'hoop' | 'drop';
}

export interface FacialMarkDef {
  id: string;
  label: string;
  type: 'none' | 'mole_cheek' | 'mole_lip' | 'dimples' | 'scar_brow' | 'bandaid';
}

// 12 Distinct Harmonious Face Shapes (viewBox 200x200, center x=100, y=104)
export const FACE_SHAPES: FaceShapeDef[] = [
  {
    id: 'oval',
    label: 'Oval',
    path: 'M 100 52 C 127 52, 143 72, 142 104 C 141 133, 123 153, 100 154 C 77 153, 59 133, 58 104 C 57 72, 73 52, 100 52 Z',
    earOffsetX: 43,
    earOffsetY: 105,
    jawWidthFactor: 1.0,
    chinY: 154,
  },
  {
    id: 'redondo',
    label: 'Redondo',
    path: 'M 100 54 C 130 54, 147 75, 146 105 C 145 134, 126 151, 100 151 C 74 151, 55 134, 54 105 C 53 75, 70 54, 100 54 Z',
    earOffsetX: 47,
    earOffsetY: 105,
    jawWidthFactor: 1.08,
    chinY: 151,
  },
  {
    id: 'quadrado',
    label: 'Quadrado',
    path: 'M 100 52 C 128 52, 143 68, 143 98 L 141 132 C 140 144, 124 152, 100 152 C 76 152, 60 144, 59 132 L 57 98 C 57 68, 72 52, 100 52 Z',
    earOffsetX: 44,
    earOffsetY: 103,
    jawWidthFactor: 1.12,
    chinY: 152,
  },
  {
    id: 'alongado',
    label: 'Alongado',
    path: 'M 100 49 C 123 49, 138 69, 138 103 C 138 135, 121 157, 100 158 C 79 157, 62 135, 62 103 C 62 69, 77 49, 100 49 Z',
    earOffsetX: 39,
    earOffsetY: 104,
    jawWidthFactor: 0.92,
    chinY: 158,
  },
  {
    id: 'largo',
    label: 'Largo',
    path: 'M 100 53 C 133 53, 149 74, 148 106 C 147 136, 129 152, 100 152 C 71 152, 53 136, 52 106 C 51 74, 67 53, 100 53 Z',
    earOffsetX: 49,
    earOffsetY: 105,
    jawWidthFactor: 1.15,
    chinY: 152,
  },
  {
    id: 'fino',
    label: 'Fino',
    path: 'M 100 51 C 122 51, 136 71, 135 103 C 134 132, 117 154, 100 155 C 83 154, 66 132, 65 103 C 64 71, 78 51, 100 51 Z',
    earOffsetX: 36,
    earOffsetY: 103,
    jawWidthFactor: 0.88,
    chinY: 155,
  },
  {
    id: 'coracao',
    label: 'Coração',
    path: 'M 100 52 C 129 52, 145 70, 143 99 C 141 126, 118 152, 100 155 C 82 152, 59 126, 57 99 C 55 70, 71 52, 100 52 Z',
    earOffsetX: 44,
    earOffsetY: 101,
    jawWidthFactor: 0.9,
    chinY: 155,
  },
  {
    id: 'diamante',
    label: 'Diamante',
    path: 'M 100 51 C 122 51, 143 76, 144 102 C 145 123, 118 153, 100 155 C 82 153, 55 123, 56 102 C 57 76, 78 51, 100 51 Z',
    earOffsetX: 45,
    earOffsetY: 103,
    jawWidthFactor: 0.94,
    chinY: 155,
  },
  {
    id: 'triangulo_invertido',
    label: 'Triangular Suave',
    path: 'M 100 51 C 131 51, 145 70, 142 98 C 139 127, 116 151, 100 153 C 84 151, 61 127, 58 98 C 55 70, 69 51, 100 51 Z',
    earOffsetX: 43,
    earOffsetY: 101,
    jawWidthFactor: 0.92,
    chinY: 153,
  },
  {
    id: 'pera',
    label: 'Base Firme',
    path: 'M 100 53 C 123 53, 138 72, 142 104 C 145 135, 128 152, 100 153 C 72 152, 55 135, 58 104 C 62 72, 77 53, 100 53 Z',
    earOffsetX: 43,
    earOffsetY: 104,
    jawWidthFactor: 1.1,
    chinY: 153,
  },
  {
    id: 'suave',
    label: 'Clássico Suave',
    path: 'M 100 52 C 126 52, 141 73, 140 105 C 139 134, 121 151, 100 152 C 79 151, 61 134, 60 105 C 59 73, 74 52, 100 52 Z',
    earOffsetX: 41,
    earOffsetY: 104,
    jawWidthFactor: 0.98,
    chinY: 152,
  },
  {
    id: 'infantil',
    label: 'Bochechas Cheias',
    path: 'M 100 56 C 129 56, 146 77, 147 107 C 147 135, 126 150, 100 150 C 74 150, 53 135, 53 107 C 54 77, 71 56, 100 56 Z',
    earOffsetX: 48,
    earOffsetY: 107,
    jawWidthFactor: 1.09,
    chinY: 150,
  },
];

// 12 Rich Brazilian Skin Tone Palettes
export const SKIN_TONES: SkinToneDef[] = [
  { id: 'porcelana', label: 'Porcelana', base: '#FDE5D6', shadow: '#EBC3AC', highlight: '#FFF3EC', blush: '#F7A8A8', lipBase: '#DE8787', outline: '#3B2822' },
  { id: 'clara_rosada', label: 'Clara Rosada', base: '#FAD9C5', shadow: '#E3B49B', highlight: '#FFEBE0', blush: '#F49797', lipBase: '#D97B7D', outline: '#3B2822' },
  { id: 'clara_dourada', label: 'Clara Dourada', base: '#F6CFAF', shadow: '#DBAA84', highlight: '#FCE3CC', blush: '#EC9A86', lipBase: '#CE796E', outline: '#36231C' },
  { id: 'oliva_clara', label: 'Oliva Clara', base: '#ECC39B', shadow: '#CE9E74', highlight: '#F7D7B7', blush: '#E0927D', lipBase: '#C47368', outline: '#332019' },
  { id: 'morena_clara', label: 'Morena Clara', base: '#E4B186', shadow: '#C38D61', highlight: '#F0C7A3', blush: '#D8826E', lipBase: '#B9645B', outline: '#2E1C16' },
  { id: 'parda_dourada', label: 'Parda Dourada', base: '#D59C6F', shadow: '#B3784C', highlight: '#E4B38A', blush: '#C9705D', lipBase: '#AA5951', outline: '#2A1913' },
  { id: 'bronzeada', label: 'Bronzeada', base: '#C68859', shadow: '#A4683D', highlight: '#D69F74', blush: '#B85F4F', lipBase: '#9D4F47', outline: '#261610' },
  { id: 'morena_media', label: 'Morena Média', base: '#B5774B', shadow: '#935931', highlight: '#C78E64', blush: '#A85245', lipBase: '#8F4640', outline: '#22130E' },
  { id: 'caramelo', label: 'Caramelo', base: '#9D623B', shadow: '#7D4724', highlight: '#B17852', blush: '#94433B', lipBase: '#7E3C37', outline: '#1E110C' },
  { id: 'acaju', label: 'Acaju', base: '#844D2D', shadow: '#65361B', highlight: '#996241', blush: '#7D3631', lipBase: '#6D322E', outline: '#1A0E09' },
  { id: 'retinta', label: 'Negra Retinta', base: '#693B22', shadow: '#4B2713', highlight: '#7E4E34', blush: '#662B27', lipBase: '#5A2926', outline: '#140B07' },
  { id: 'ebano', label: 'Ébano Profundo', base: '#512B18', shadow: '#381B0D', highlight: '#663B25', blush: '#52211E', lipBase: '#49201D', outline: '#100805' },
];

// 10 Distinct Eye Styles
export const EYE_STYLES: EyeStyleDef[] = [
  { id: 'medios', label: 'Médios Clássicos', rx: 7.5, ry: 6.2, irisRadius: 4.1, pupilRadius: 2.1, tiltDeg: 0, lashStyle: 'subtle' },
  { id: 'pequenos', label: 'Pequenos', rx: 6.2, ry: 4.9, irisRadius: 3.3, pupilRadius: 1.7, tiltDeg: 0, lashStyle: 'none' },
  { id: 'grandes', label: 'Grandes Expressivos', rx: 8.8, ry: 7.8, irisRadius: 5.0, pupilRadius: 2.5, tiltDeg: 0, lashStyle: 'subtle' },
  { id: 'arredondados', label: 'Arredondados', rx: 7.6, ry: 7.4, irisRadius: 4.6, pupilRadius: 2.3, tiltDeg: 0, lashStyle: 'subtle' },
  { id: 'alongados', label: 'Alongados', rx: 8.9, ry: 5.0, irisRadius: 3.8, pupilRadius: 1.9, tiltDeg: -2, lashStyle: 'winged' },
  { id: 'amendoados', label: 'Amendoados', rx: 8.3, ry: 5.7, irisRadius: 4.0, pupilRadius: 2.0, tiltDeg: -5, lashStyle: 'winged' },
  { id: 'puxados', label: 'Puxados', rx: 8.6, ry: 4.6, irisRadius: 3.6, pupilRadius: 1.8, tiltDeg: -9, lashStyle: 'subtle' },
  { id: 'caidos', label: 'Levemente Caídos', rx: 7.8, ry: 5.8, irisRadius: 4.0, pupilRadius: 2.0, tiltDeg: 6, lashStyle: 'none' },
  { id: 'cilios_marcantes', label: 'Cílios Marcantes', rx: 8.0, ry: 6.6, irisRadius: 4.4, pupilRadius: 2.2, tiltDeg: -3, lashStyle: 'thick' },
  { id: 'semicerrados', label: 'Semicerrados', rx: 8.2, ry: 4.4, irisRadius: 3.6, pupilRadius: 1.8, tiltDeg: 0, lashStyle: 'none' },
];

export const EYE_COLORS: EyeColorDef[] = [
  { id: 'castanho_escuro', label: 'Castanho Escuro', hex: '#3B2314', ringHex: '#231309' },
  { id: 'castanho_medio', label: 'Castanho Médio', hex: '#633B1F', ringHex: '#3E2210' },
  { id: 'mel', label: 'Mel / Âmbar', hex: '#9A6324', ringHex: '#633D12' },
  { id: 'avela', label: 'Avelã', hex: '#7A6836', ringHex: '#4E411E' },
  { id: 'verde_esmeralda', label: 'Verde Esmeralda', hex: '#2E7D5B', ringHex: '#194D37' },
  { id: 'verde_claro', label: 'Verde Claro', hex: '#4FA07B', ringHex: '#2C6B4E' },
  { id: 'azul_profundo', label: 'Azul Profundo', hex: '#255B99', ringHex: '#153861' },
  { id: 'azul_claro', label: 'Azul Claro', hex: '#4E8FD4', ringHex: '#2C5E96' },
  { id: 'cinza', label: 'Cinza Azulado', hex: '#64748B', ringHex: '#334155' },
  { id: 'preto', label: 'Preto Jabuticaba', hex: '#18181B', ringHex: '#09090B' },
];

export const EYEBROW_STYLES: EyebrowStyleDef[] = [
  { id: 'natural', label: 'Natural', thickness: 2.8, arch: 2.2, length: 16, style: 'natural' },
  { id: 'arqueada', label: 'Arqueada', thickness: 2.3, arch: 4.2, length: 16, style: 'arched' },
  { id: 'reta', label: 'Reta', thickness: 3.0, arch: 0.6, length: 16, style: 'straight' },
  { id: 'grossa', label: 'Marcante', thickness: 4.2, arch: 1.8, length: 17, style: 'thick' },
  { id: 'fina', label: 'Fina Delicada', thickness: 1.7, arch: 3.2, length: 15, style: 'thin' },
  { id: 'curva', label: 'Curva Suave', thickness: 2.5, arch: 3.0, length: 15, style: 'curved' },
  { id: 'angular', label: 'Angular', thickness: 2.9, arch: 3.8, length: 16, style: 'angular' },
  { id: 'cheia', label: 'Cheia', thickness: 4.6, arch: 1.2, length: 18, style: 'bushy' },
];

export const NOSE_STYLES: NoseStyleDef[] = [
  { id: 'pequeno', label: 'Pequeno', width: 6.5, height: 10, type: 'pequeno' },
  { id: 'medio', label: 'Médio', width: 8.5, height: 12.5, type: 'medio' },
  { id: 'largo', label: 'Largo', width: 11.5, height: 12, type: 'largo' },
  { id: 'fino', label: 'Fino', width: 6.0, height: 13.5, type: 'fino' },
  { id: 'arredondado', label: 'Arredondado', width: 9.5, height: 11.5, type: 'arredondado' },
  { id: 'aquilino', label: 'Marcado', width: 8.0, height: 14, type: 'aquilino' },
];

export const MOUTH_STYLES: MouthStyleDef[] = [
  { id: 'medio', label: 'Lábios Médios', width: 22, lipFullness: 1.0, cupidsBow: 1.0 },
  { id: 'cheios', label: 'Lábios Cheios', width: 23, lipFullness: 1.45, cupidsBow: 1.2 },
  { id: 'finos', label: 'Lábios Finos', width: 20, lipFullness: 0.65, cupidsBow: 0.7 },
  { id: 'largo', label: 'Sorriso Largo', width: 26, lipFullness: 1.0, cupidsBow: 0.9 },
  { id: 'discreto', label: 'Boca Pequena', width: 17, lipFullness: 0.95, cupidsBow: 1.1 },
  { id: 'arco', label: 'Arco Definido', width: 21, lipFullness: 1.25, cupidsBow: 1.5 },
];

export const FACIAL_HAIR_STYLES: FacialHairDef[] = [
  { id: 'none', label: 'Sem Barba', type: 'none' },
  { id: 'stubble', label: 'Barba por Fazer', type: 'stubble' },
  { id: 'goatee', label: 'Cavanhaque', type: 'goatee' },
  { id: 'trimmed', label: 'Barba Aparada', type: 'trimmed' },
  { id: 'full', label: 'Barba Cheia', type: 'full' },
  { id: 'lumberjack', label: 'Barba Longa', type: 'lumberjack' },
  { id: 'chinstrap', label: 'Barba Desenhada', type: 'chinstrap' },
];

export const MUSTACHE_STYLES: MustacheDef[] = [
  { id: 'none', label: 'Sem Bigode', type: 'none' },
  { id: 'thin', label: 'Bigode Fino', type: 'thin' },
  { id: 'classic', label: 'Bigode Clássico', type: 'classic' },
  { id: 'thick', label: 'Bigode Cheio', type: 'thick' },
  { id: 'handlebar', label: 'Bigode Estilizado', type: 'handlebar' },
];

export const GLASSES_STYLES: GlassesDef[] = [
  { id: 'none', label: 'Sem Óculos', type: 'none', frameColor: 'transparent' },
  { id: 'round', label: 'Redondos', type: 'round', frameColor: '#1E293B' },
  { id: 'square', label: 'Quadrados', type: 'square', frameColor: '#0F172A' },
  { id: 'aviator', label: 'Aviador', type: 'aviator', frameColor: '#B45309' },
  { id: 'cateye', label: 'Gatinho', type: 'cateye', frameColor: '#881337' },
  { id: 'half', label: 'Meia-Armação', type: 'half', frameColor: '#334155' },
  { id: 'sunglasses', label: 'Óculos de Sol', type: 'sunglasses', frameColor: '#09090B' },
];

export const EARRING_STYLES: EarringDef[] = [
  { id: 'none', label: 'Sem Brincos', type: 'none' },
  { id: 'stud', label: 'Ponto de Luz', type: 'stud' },
  { id: 'hoop', label: 'Argolas', type: 'hoop' },
  { id: 'drop', label: 'Pendentes', type: 'drop' },
];

export const FACIAL_MARK_STYLES: FacialMarkDef[] = [
  { id: 'none', label: 'Nenhuma', type: 'none' },
  { id: 'mole_cheek', label: 'Pinta na Bochecha', type: 'mole_cheek' },
  { id: 'mole_lip', label: 'Pinta Perto do Lábio', type: 'mole_lip' },
  { id: 'dimples', label: 'Covinhas', type: 'dimples' },
  { id: 'scar_brow', label: 'Cicatriz na Sobrancelha', type: 'scar_brow' },
  { id: 'bandaid', label: 'Curativo no Nariz', type: 'bandaid' },
];

export const BACKDROP_COLORS = [
  '#D1FAE5', // soft mint
  '#DBEAFE', // soft sky
  '#FEF3C7', // warm cream
  '#FCE7F3', // soft rose
  '#E0E7FF', // soft indigo
  '#FFEDD5', // soft peach
  '#E2E8F0', // clean slate
  '#CCFBF1', // soft teal
];

export const SHIRT_COLORS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#F59E0B', // amber
  '#EC4899', // pink
  '#6366F1', // indigo
  '#EF4444', // red
  '#14B8A6', // teal
  '#475569', // slate
  '#8B5CF6', // violet
  '#F97316', // orange
];

export function findFaceShape(id?: string): FaceShapeDef {
  return FACE_SHAPES.find(f => f.id === id) || FACE_SHAPES[0];
}
export function findSkinTone(id?: string): SkinToneDef {
  return SKIN_TONES.find(s => s.id === id) || SKIN_TONES[3];
}
export function findEyeStyle(id?: string): EyeStyleDef {
  return EYE_STYLES.find(e => e.id === id) || EYE_STYLES[0];
}
export function findEyeColor(id?: string): EyeColorDef {
  return EYE_COLORS.find(e => e.id === id) || EYE_COLORS[0];
}
export function findEyebrowStyle(id?: string): EyebrowStyleDef {
  return EYEBROW_STYLES.find(e => e.id === id) || EYEBROW_STYLES[0];
}
export function findNoseStyle(id?: string): NoseStyleDef {
  return NOSE_STYLES.find(n => n.id === id) || NOSE_STYLES[1];
}
export function findMouthStyle(id?: string): MouthStyleDef {
  return MOUTH_STYLES.find(m => m.id === id) || MOUTH_STYLES[0];
}
export function findFacialHair(id?: string): FacialHairDef {
  return FACIAL_HAIR_STYLES.find(f => f.id === id) || FACIAL_HAIR_STYLES[0];
}
export function findMustache(id?: string): MustacheDef {
  return MUSTACHE_STYLES.find(m => m.id === id) || MUSTACHE_STYLES[0];
}
export function findGlasses(id?: string): GlassesDef {
  return GLASSES_STYLES.find(g => g.id === id) || GLASSES_STYLES[0];
}
export function findEarrings(id?: string): EarringDef {
  return EARRING_STYLES.find(e => e.id === id) || EARRING_STYLES[0];
}
export function findFacialMark(id?: string): FacialMarkDef {
  return FACIAL_MARK_STYLES.find(m => m.id === id) || FACIAL_MARK_STYLES[0];
}
