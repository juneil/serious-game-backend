import { Game, GameState, GameStateStep } from '../../models/game.model';
import { GameRepository } from '../../repositories/game.repository';
import { BusinessError, ErrorCode } from '../../utils/error';

export abstract class BaseStateService<T extends GameState, U> {
    protected gameRepository: GameRepository;
    abstract type: GameStateStep;
    abstract update(game: Game, state: T, data: U): Promise<GameState>;

    protected checkState(game: Game, state: T, step: GameStateStep): T {
        if (state?.step === step && state.applied < game.nb_players) {
            return state;
        }
        throw new BusinessError(ErrorCode.E005, `State cannot be updated [${game.id}]`);
    }

    protected async complete(game: Game, state: T, step: GameStateStep): Promise<boolean> {
        return Promise.resolve(null)
            .then(() => this.checkState(game, state, step))
            .then(() => false)
            .catch(() => this.gameRepository.completeState(state).then(() => true));
    }
}
