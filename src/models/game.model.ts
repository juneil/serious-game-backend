import { AnyOf, Enum, ExtendRules, Item, Required, Simple } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum GameStateStep {
    Seed = 'SEED'
}

@ExtendRules(PersistentEntity)
export class Game extends PersistentEntity {
    @Required user_id: string;
    @Required nb_players: number;
    @Required nb_teams: number;
    @Required nb_rounds: number;
    @Required round_duration: number;
    @Required penality: number;
    @Required penality_rate: number;
    @Required quizz: boolean;
    @Simple denomination?: string;
}

@ExtendRules(PersistentEntity)
export class GameState {
    @Required game_id: string;
    @Required user_id: string;
    @Required completed: boolean;
    @Required @Enum(...Object.values(GameStateStep)) step: GameStateStep;
}

@ExtendRules(GameState)
export class GameStateSeed extends GameState {
    @Required applied: number;
    @Required @Item(Array) answers: number[][];
}

export class StatesList {
    @Required @Item(AnyOf(GameStateSeed)) states: GameState[];
}
