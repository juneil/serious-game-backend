import { ExtendRules, Item, Max, Min, Required } from '@ekonoo/models';
import { GameState } from './game.model';

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
