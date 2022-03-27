import { Item, Max, Min, Required, Simple } from '@ekonoo/models';
import { Game } from '../game.model';

export class PostGame {
    @Required @Min(1) @Max(20) nb_players: number;
    @Required @Min(2) @Max(5) nb_teams: number;
    @Required @Min(1) @Max(5) nb_rounds: number;
    @Required @Min(1) @Max(60) round_duration: number;
    @Required @Min(0) @Max(60) penality: number;
    @Required @Min(0) @Max(1) penality_rate: number;
    @Required quizz: boolean;
    @Simple denomination?: string;
}

export class ListGameResponse {
    @Required @Item(Game) games: Game[];
}

export class GetPathParam {
    @Required id: string;
}

export class PostAppendSeed {
    @Required @Item(Number) answers: number[];
}

export class PutGroupParam {
    @Required id: string;
    @Required group: string;
}

export class PutGroupPlayer {
    @Required firstname: string;
    @Required lastname: string;
    @Required email: string;
    @Required function: string;
    @Required @Min(0) @Max(60) experience: number;
    @Required @Min(16) @Max(120) age: number;
}

export class PutGroupPayload {
    @Required name: string;
    @Required @Item(PutGroupPlayer) players: PutGroupPlayer[];
}
