import { AnyOf, Enum, ExtendRules, Item, Required, Simple } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum GameStateStep {
    Seed = 'SEED',
    Group = 'GROUP'
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
    @Simple status?: GameStateStep;
    @Simple denomination?: string;
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

@ExtendRules(GameState)
export class GameStateSeed extends GameState {
    @Required @Item(Array) answers: number[][];
}

@ExtendRules(GameState)
export class GameStateGroup extends GameState {
}

export class StatesList {
    @Required @Item(AnyOf(GameStateSeed, GameStateGroup)) states: GameState[];
}

export class GameGroupPlayer {
    @Required firstname: string;
    @Required lastname: string;
    @Required email: string;
    @Required function: string;
    @Required experience: number;
    @Required age: number;
}

@ExtendRules(PersistentEntity)
export class GameGroup extends PersistentEntity {
    @Required name: string;
    @Required @Item(GameGroupPlayer) players: GameGroupPlayer[];
}
