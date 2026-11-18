import { WorldCultureState, WorldState } from '../types/world';

export class WorldCultureEngine {
  static resolveDecadeProfile(year: number): WorldCultureState {
    if (year < 1940) {
      return {
        dominantMusicGenres: ['Samba Tradicional', 'Choro', 'Marchinhas de Carnaval', 'Jazz'],
        dominantMediaFormats: ['Jornais Impressos', 'Rádio', 'Cinema Mudo/Sonoro'],
        fashionTrend: 'Ternos de linho, chapéus e vestidos longos clássicos',
        socialValues: { digitalization: 2, familyTraditionalism: 92, environmentalAwareness: 15, civicParticipation: 45, entrepreneurship: 38 },
        popularSports: ['Futebol amador e profissional nascente', 'Remo'],
        slangOrCulturalMarker: 'Era de Ouro do Rádio e ascensão cultural urbana',
      };
    }
    if (year < 1965) {
      return {
        dominantMusicGenres: ['Bossa Nova', 'Samba-Canção', 'Baião', 'Rock Clássico'],
        dominantMediaFormats: ['Rádio Nacional', 'Início da TV Aberta', 'Revistas Ilustradas'],
        fashionTrend: 'Estilo anos dourados, elegância tropical e saias rodadas',
        socialValues: { digitalization: 6, familyTraditionalism: 86, environmentalAwareness: 20, civicParticipation: 62, entrepreneurship: 50 },
        popularSports: ['Futebol (Maracanã & Copas)', 'Basquete', 'Boxe'],
        slangOrCulturalMarker: 'Modernismo brasileiro, Brasília e Bossa Nova',
      };
    }
    if (year < 1985) {
      return {
        dominantMusicGenres: ['MPB', 'Tropicália', 'Jovem Guarda', 'Samba de Raiz', 'Disco'],
        dominantMediaFormats: ['Televisão em Cores', 'Telenovelas', 'Discos de Vinil'],
        fashionTrend: 'Calças boca-de-sino, estampas psicodélicas e moda jovem urbana',
        socialValues: { digitalization: 14, familyTraditionalism: 76, environmentalAwareness: 30, civicParticipation: 54, entrepreneurship: 55 },
        popularSports: ['Futebol (Tricampeonato)', 'Automobilismo (Fórmula 1)'],
        slangOrCulturalMarker: 'Cultura de massa televisiva e festivais de música',
      };
    }
    if (year < 2000) {
      return {
        dominantMusicGenres: ['Rock Nacional', 'Axé', 'Pagode', 'Sertanejo Romântico', 'Rap'],
        dominantMediaFormats: ['TV Aberta & Cabo', 'CDs e Fitas K7', 'Início da Web'],
        fashionTrend: 'Jeans cintura alta, tênis esportivos e jaquetas oversized',
        socialValues: { digitalization: 28, familyTraditionalism: 66, environmentalAwareness: 46, civicParticipation: 74, entrepreneurship: 62 },
        popularSports: ['Futebol', 'Vôlei', 'Fórmula 1'],
        slangOrCulturalMarker: 'Redemocratização, MTV Brasil e chegada da internet discada',
      };
    }
    if (year < 2015) {
      return {
        dominantMusicGenres: ['Funk Carioca', 'Sertanejo Universitário', 'Pop', 'MPB Contemporânea'],
        dominantMediaFormats: ['Portais Web', 'Orkut / Redes Sociais Iniciais', 'TV Digital'],
        fashionTrend: 'Moda casual urbana, streetwear inicial e acessórios digitais',
        socialValues: { digitalization: 62, familyTraditionalism: 55, environmentalAwareness: 62, civicParticipation: 70, entrepreneurship: 72 },
        popularSports: ['Futebol', 'MMA / Artes Marciais', 'Vôlei'],
        slangOrCulturalMarker: 'Inclusão digital, banda larga e ascensão da nova classe média',
      };
    }
    if (year <= 2026) {
      return {
        dominantMusicGenres: ['Sertanejo', 'Funk & Trap Nacional', 'Piseiro', 'Pop Streaming'],
        dominantMediaFormats: ['Streaming de Vídeo/Áudio', 'Vídeos Curtos', 'Redes Sociais & Pix'],
        fashionTrend: 'Streetwear confortável, moda sustentável e estética digital',
        socialValues: { digitalization: 86, familyTraditionalism: 48, environmentalAwareness: 74, civicParticipation: 68, entrepreneurship: 80 },
        popularSports: ['Futebol', 'E-Sports', 'Skate & Surfe Olímpico', 'Corrida de Rua'],
        slangOrCulturalMarker: 'Economia digital, trabalho híbrido e cultura de criadores',
      };
    }
    return {
      dominantMusicGenres: ['Música Híbrida Generativa', 'Neo-MPB Global', 'Ritmos Regionais Digitais'],
      dominantMediaFormats: ['Mídia Imersiva', 'Assistentes Pessoais Contextuais', 'Streaming Interativo'],
      fashionTrend: 'Tecidos inteligentes sustentáveis e design funcional',
      socialValues: { digitalization: 95, familyTraditionalism: 44, environmentalAwareness: 85, civicParticipation: 72, entrepreneurship: 84 },
      popularSports: ['Futebol', 'Ligas Virtuais Imersivas', 'Esportes de Longevidade'],
      slangOrCulturalMarker: 'Sociedade hiperconectada e economia verde (Projeção)',
    };
  }

  static createInitialState(year: number): WorldCultureState {
    return this.resolveDecadeProfile(year);
  }

  static advanceYear(world: WorldState, year: number): void {
    const profile = this.resolveDecadeProfile(year);
    const prev = world.culture;
    const digitalShift = Math.min(99, Math.max(prev.socialValues.digitalization, world.technology.brazilTechIndex * 0.95));
    world.culture = {
      ...profile,
      socialValues: {
        digitalization: Math.round(digitalShift),
        familyTraditionalism: Math.round(prev.socialValues.familyTraditionalism * 0.7 + profile.socialValues.familyTraditionalism * 0.3),
        environmentalAwareness: Math.round(prev.socialValues.environmentalAwareness * 0.7 + profile.socialValues.environmentalAwareness * 0.3),
        civicParticipation: Math.round(
          (prev.socialValues.civicParticipation * 0.6 +
            profile.socialValues.civicParticipation * 0.25 +
            (world.politics?.citizenParticipationScore ?? 55) * 0.15)
        ),
        entrepreneurship: Math.round(prev.socialValues.entrepreneurship * 0.7 + profile.socialValues.entrepreneurship * 0.3),
      },
    };
  }
}
