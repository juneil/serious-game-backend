import { Service } from '@ekonoo/lambdi';
import { Game, GameStateSeed, GameStateStep } from '../../models/game.model';
import { GameRepository } from '../../repositories/game.repository';
import { BusinessError, ErrorCode } from '../../utils/error';
import { StateService } from './state.service';

@Service({ providers: [GameRepository] })
export class SeedStateService extends StateService<GameStateSeed, { answers: number[] }> {
    constructor(private gameRepository: GameRepository) {
        super();
    }

    private checkState(game: Game, state: GameStateSeed): GameStateSeed {
        if (state?.step === GameStateStep.Seed && (state as GameStateSeed).applied < game.nb_players) {
            return state;
        }
        throw new BusinessError(ErrorCode.E005, `Can not append for seeding for the game [${game.id}]`);
    }

    async update(game: Game, state: GameStateSeed, data: { answers: number[] }): Promise<GameStateSeed> {
        return Promise.resolve(state)
            .then(state => this.checkState(game, state))
            .then(() =>
                this.gameRepository
                    .addStateSeed(game.user_id, game.id as string, data.answers)
                    .then(state => ({ state, game }))
            )
            .then(({ state, game }) => (state.applied >= game.nb_players ? this.complete(game, state) : state));
    }

    async complete(game: Game, state: GameStateSeed): Promise<GameStateSeed> {
        return this.gameRepository.completeState(state).then(() => this.seed.generate(state));
    }
}
