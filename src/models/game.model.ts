import { Enum, ExtendRules, Item, Max, Min, Required, Simple } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum GameStateStep {
    Seed = 'SEED',
    Group = 'GROUP',
    RoundP1 = 'ROUND_P1',
    RoundP2 = 'ROUND_P2',
    RoundP3 = 'ROUND_P3'
}

export enum GameInvestmentType {
    Legal = 'LEGAL',
    Marketing = 'MARKETING',
    Digital = 'DIGITAL'
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

export class PostGame {
    @Required scenario_id: string;
    @Required @Min(1) @Max(20) nb_players: number;
    @Required @Min(2) @Max(5) nb_teams: number;
    @Required @Min(1) @Max(5) nb_rounds: number;
    @Required @Min(1) @Max(60) round_duration: number;
    @Required @Min(0) @Max(60) penality: number;
    @Required @Min(0) @Max(1) penality_rate: number;
    @Required @Min(3) @Max(50) denomination: string;
}

export class ListGameResponse {
    @Required @Item(Game) games: Game[];
}

/**
 * ####################################
 * ########## STATE MODELS ############
 * ####################################
 */

@ExtendRules(PersistentEntity)
export class GameState {
    @Required game_id: string;
    @Required user_id: string;
    @Required completed: boolean;
    @Required applied: number;
    @Required total: number;
    @Simple round?: number;
    @Required @Enum(...Object.values(GameStateStep)) step: GameStateStep;
}

/**
 * ####################################
 * ########  SEED STATE MODELS ########
 * ####################################
 */

export class SeedSensis {
    @Required @Min(1) @Max(4) service: number;
    @Required @Min(1) @Max(4) cost: number;
    @Required @Min(1) @Max(4) performance: number;
    @Required @Min(1) @Max(4) protection: number;
}

export class SeedAnswer {
    @Required @Min(16) @Max(120) age: number;
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
    @Required sales: boolean;
    @Required sensis: SeedSensis;
}

export class SeedSensisResult {
    @Required age: number;
    @Required tg: number;
    @Required uc: number;
    @Required tg_rate: number;
    @Required commission: number;
    @Required entry_fee: number;
    @Required garantee: number;
    @Required garantee_fee: number;
    @Required marketing: number;
    @Required backoffice: number;
    @Required management_fee: number;
    @Required sales: number;
    @Required service: number;
    @Required cost: number;
    @Required performance: number;
    @Required protection: number;
}

@ExtendRules(GameState)
export class SeedState extends GameState {
    @Required @Item(SeedAnswer) answers: SeedAnswer[];
    @Simple sensis?: SeedSensisResult;
    @Simple @Item(Number) region_indexes: number[];
}

/**
 * ####################################
 * ######## GROUP STATE MODELS ########
 * ####################################
 */

export class GroupPlayer {
    @Required @Min(2) @Max(100) firstname: string;
    @Required @Min(2) @Max(100) lastname: string;
    @Required @Min(2) @Max(100) email: string;
    @Required @Min(2) @Max(50) function: string;
    @Required @Min(0) @Max(90) experience: number;
    @Required @Min(16) @Max(120) age: number;
}

export class GroupAnswer {
    @Required @Min(2) @Max(100) name: string;
    @Required @Item(GroupPlayer) players: GroupPlayer[];
}

@ExtendRules(GameState)
export class GroupState extends GameState {
    @Required @Item(GroupAnswer) answers: GroupAnswer[];
}

/**
 * ####################################
 * ########  RP1 STATE MODELS  ########
 * ####################################
 */


export class SliceItem {
    @Required @Min(10) @Max(10) code: string;
    @Required @Min(0) @Max(1) part: number;
}

export class RoundP1Answer {
    @Required @Item(SliceItem) funds: SliceItem[];
    @Required @Item(SliceItem) tg: SliceItem[];

}

 @ExtendRules(GameState)
 export class RoundP1State extends GameState {
     @Required @Item(SeedAnswer) answers: SeedAnswer[];
 }
