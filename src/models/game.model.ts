import { Enum, ExtendRules, Pattern, Required, Simple } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum GameStatus {
    Created = '1_CREATED',
    IndividualFormProcessed = '2_INDIVIDUAL_FORM_PROCESSED'
}

@ExtendRules(PersistentEntity)
export class Game extends PersistentEntity {
    @Required user_id: string;
    @Required @Enum(...Object.values(GameStatus)) status: GameStatus;
    @Required nb_players: number;
    @Required nb_teams: number;
    @Required nb_rounds: number;
    @Required round_duration: number;
    @Required penality: number;
    @Required penality_rate: number;
    @Required quizz: boolean;
    @Simple denomination?: string;
}
