import { Service } from '@ekonoo/lambdi';
import {
    Game,
    GameState,
    GameStateStep,
    RoundP1Answer,
    RoundP1State
} from '../../models/game.model';
import { GameRepository } from '../../repositories/game.repository';
import { CompanyService } from '../company.service';
import { BaseStateService } from './base-state.service';

@Service({ providers: [GameRepository, CompanyService] })
export class RoundPart1StateService extends BaseStateService<RoundP1State, RoundP1Answer> {
    public type = GameStateStep.RoundP1;

    constructor(protected gameRepository: GameRepository, private company: CompanyService) {
        super();
    }

    async update(_: Game, state: RoundP1State, data: RoundP1Answer): Promise<GameState> {
        return Promise.resolve(state)
            .then(state => super.checkState(state))
            .then(() =>
                this.gameRepository.updateState(
                    state.user_id,
                    state.game_id as string,
                    data,
                    RoundP1State
                )
            )
            .then(state => this.complete(state).then(() => state));
    }
}
