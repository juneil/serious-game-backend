import { Enum, ExtendRules, Item, Max, Min, Required } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum GameStateStep {
    Seed = 'SEED',
    Group = 'GROUP'
}

@ExtendRules(PersistentEntity)
export class Game extends PersistentEntity {
    @Required user_id: string;
    @Required scenario_id: string;
    @Required @Min(1) @Max(20) nb_players: number;
    @Required @Min(2) @Max(5) nb_teams: number;
    @Required @Min(1) @Max(5) nb_rounds: number;
    @Required @Min(1) @Max(60) round_duration: number;
    @Required @Min(0) @Max(60) penality: number;
    @Required @Min(0) @Max(1) penality_rate: number;
    @Required @Min(3) @Max(50) denomination: string;
}

@ExtendRules(PersistentEntity)
export class GameState {
    @Required game_id: string;
    @Required user_id: string;
    @Required completed: boolean;
    @Required applied: number;
    @Required total: number;
    @Required @Enum(...Object.values(GameStateStep)) step: GameStateStep;
}

/**
 * ####################################
 * ########  SEED STATE MODELS ########
 * ####################################
 */

export class SeedSensis {
    @Required @Min(4) @Max(4) @Item(Number) service: number[];
    @Required @Min(4) @Max(4) @Item(Number) cost: number[];
    @Required @Min(4) @Max(4) @Item(Number) performance: number[];
    @Required @Min(4) @Max(4) @Item(Number) protection: number[];
}

export class SeedAnswer {
    @Required tg: boolean;
    @Required uc: boolean;
    @Required tg_rate: boolean;
    @Required commission: boolean;
    @Required entry_fee: boolean;
    @Required garantee: boolean;
    @Required garantee_fee: boolean;
    @Required marketing: boolean;
    @Required backoffice: boolean;
    @Required management_fee: boolean;
    @Required commercial: boolean;
    @Required @Item(SeedSensis) sensis: SeedSensis[];
}

@ExtendRules(GameState)
export class SeedState extends GameState {
    @Required @Item(SeedAnswer) answers: SeedAnswer[];
    @Required
}



// export class GameGroupPlayer {
//     @Required firstname: string;
//     @Required lastname: string;
//     @Required email: string;
//     @Required function: string;
//     @Required experience: number;
//     @Required age: number;
// }

// @ExtendRules(PersistentEntity)
// export class GameGroup extends PersistentEntity {
//     @Required name: string;
//     @Required @Item(GameGroupPlayer) players: GameGroupPlayer[];
// }
