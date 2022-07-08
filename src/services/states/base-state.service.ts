import { Game, GameState, GameStateStep } from '../../models/game.model';
import { GameRepository } from '../../repositories/game.repository';
import { BusinessError, ErrorCode } from '../../utils/error';

export abstract class BaseStateService<T extends GameState, U> {
    protected gameRepository: GameRepository;
    abstract type: GameStateStep;
    abstract update(game: Game, state: T, data: U): Promise<GameState>;

    protected checkState(state: T): T {
        if (state?.step === this.type && state.applied < state.total) {
            return state;
        }
        throw new BusinessError(ErrorCode.E005, `State cannot be updated [${state.game_id}]`);
    }

    protected async complete(state: T): Promise<boolean> {
        return Promise.resolve(null)
            .then(() => this.checkState(state))
            .then(() => false)
            .catch(() => this.gameRepository.completeState(state).then(() => true));
    }
}
