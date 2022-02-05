import { Service } from '@ekonoo/lambdi';
import { Game, GameState, GameStateSeed, GameStateStep } from '../models/game.model';
import { GameRepository } from '../repositories/game.repository';
import { BusinessError, ErrorCode } from '../utils/error';
import { SeedService } from './seed.service';

@Service({ providers: [GameRepository, SeedService] })
export class GameService {
    constructor(private gameRepository: GameRepository, private seed: SeedService) {}

    async create(game: Game): Promise<Game> {
        return this.gameRepository.create(game).then(created =>
            this.gameRepository
                .createState({
                    answers: [],
                    applied: 0,
                    total: game.nb_players,
                    completed: false,
                    game_id: created.id,
                    user_id: created.user_id,
                    step: GameStateStep.Seed
                } as GameStateSeed)
                .then(() => created)
        );
    }

    async getByUserId(userId: string): Promise<Game[]> {
        return this.gameRepository.getByUserId(userId);
    }

    async getById(id: string): Promise<Game | undefined> {
        return this.gameRepository.getById(id);
    }

    async updateStateSeed(gameId: string, answers: number[]): Promise<void> {
        return this.gameRepository
            .getById(gameId)
            .then(game => game || Promise.reject(new BusinessError(ErrorCode.E004, 'Game not found')))
            .then(game =>
                this.getCurrentStateByGame(game)
                    .then(state => this.checkStateSeed(state, game))
                    .then(() => game)
            )
            .then(game =>
                this.gameRepository.addStateSeed(game.user_id, gameId, answers).then(state => ({ state, game }))
            )
            .then(({ state, game }) =>
                state.applied >= game.nb_players
                    ? this.gameRepository.completeState(state).then(() => this.seed.generate(state))
                    : undefined
            )
            .then(() => undefined);
    }

    async getCurrentStateByGame(game: Game): Promise<GameState | undefined> {
        return this.gameRepository
            .getStatesByGame(game)
            .then(states => states.find(state => state.completed === false));
    }

    private checkStateSeed(state: GameState | undefined, game: Game): GameState {
        if (state?.step === GameStateStep.Seed && (state as GameStateSeed).applied < game.nb_players) {
            return state;
        }
        throw new BusinessError(ErrorCode.E005, `Can not append for seeding for the game [${game.id}]`);
    }
}
