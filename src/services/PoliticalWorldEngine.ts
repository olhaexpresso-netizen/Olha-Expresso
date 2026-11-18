import { GameSave } from '../types';
import { WorldState } from '../types/world';
import { WorldPoliticsEngine } from './WorldPoliticsEngine';

/**
 * Composable geopolitical facade exposing election cycles, civic rights, bilateral relations, and civic participation.
 */
export class PoliticalWorldEngine {
  static stepYear(world: WorldState, year: number): void {
    WorldPoliticsEngine.advanceYear(world, year);
  }

  static isElectionYearInBrazil(world: WorldState, year: number): boolean {
    return world.brazil.canVoteDirectly && year === world.brazil.nextElectionYear;
  }

  static getCountryDiplomaticStatus(world: WorldState, countryId: string): string {
    const score = world.countries[countryId]?.diplomaticRelationWithBrazil ?? 50;
    if (score >= 75) return 'Parceiro Estratégico';
    if (score >= 55) return 'Relações Cordiais';
    if (score >= 30) return 'Relações Neutras';
    return 'Tensão Diplomática';
  }

  static participateInCivicAction(
    save: GameSave,
    action: 'vote' | 'debate' | 'volunteer'
  ): { message: string } {
    const world = save.worldState!;
    const char = save.character;
    const year = world.clock.year;

    if (action === 'vote') {
      if (!world.brazil.canVoteDirectly) {
        return {
          message: `Em ${year} (${world.brazil.politicalRegimeType}), não há eleições presidenciais diretas vigentes.`,
        };
      }
      if (char.currentAge < 16) {
        return { message: 'Você precisa ter ao menos 16 anos para votar.' };
      }
      world.politics.citizenParticipationScore = Math.min(
        99,
        (world.politics.citizenParticipationScore || 60) + 2
      );
      world.brazil.institutionalTrust = Math.min(
        95,
        Math.round(world.brazil.institutionalTrust + 1)
      );
      char.reputation = Math.min(100, char.reputation + 2);
      save.events.push({
        id: `evt_vote_${year}_${Date.now()}`,
        characterId: char.id,
        age: char.currentAge,
        year,
        title: 'Participação Eleitoral',
        description: `Você exerceu seu direito ao voto sob a ${world.brazil.constitution}.`,
        category: 'Política',
        truthStatus: 'SIMULATED_EVENT',
      });
      return { message: 'Voto registrado! Sua reputação cívica aumentou.' };
    }

    if (action === 'debate') {
      char.charisma = Math.min(100, char.charisma + 2);
      char.reputation = Math.min(100, char.reputation + 2);
      world.politics.citizenParticipationScore = Math.min(
        99,
        (world.politics.citizenParticipationScore || 60) + 1
      );
      return { message: 'Você participou de fóruns públicos e debates comunitários.' };
    }

    // volunteer
    char.happiness = Math.min(100, char.happiness + 4);
    char.reputation = Math.min(100, char.reputation + 3);
    world.brazil.institutionalTrust = Math.min(95, Math.round(world.brazil.institutionalTrust + 1));
    return { message: 'Trabalho voluntário realizado com impacto positivo na comunidade.' };
  }
}
