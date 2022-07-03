import { Service } from '@ekonoo/lambdi';
import { Game, GameState } from '../models/game.model';
import { GameRepository } from '../repositories/game.repository';
import { BusinessError, ErrorCode } from '../utils/error';

@Service({ providers: [GameRepository] })
export class StateService {
    constructor(private gameRepository: GameRepository) {}

    async getGameState(game: Game): Promise<GameState> {
        return this.gameRepository.getStatesByGame(game)
            .then(states => states.filter(state => !state.completed))
            .then(states => states.length === 1
                ? states.pop() as GameState
                : Promise.reject(new BusinessError(ErrorCode.E999, 'Cannot have multiple uncompleted states'))
            )
    }

}
