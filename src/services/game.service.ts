import { Service } from '@ekonoo/lambdi';
import { Game, GameState, GameStateStep, SeedAnswer } from '../models/game.model';
import { GameRepository } from '../repositories/game.repository';
import { BusinessError, ErrorCode } from '../utils/error';
import { StateService } from './state.service';

@Service({ providers: [GameRepository, StateService] })
export class GameService {
    constructor(private gameRepository: GameRepository, private state: StateService) {}

    async create(game: Game): Promise<Game> {
        return this.gameRepository.create(game)
        .then(created =>
            this.gameRepository
                .createState({
                    applied: 0,
                    total: game.nb_players,
                    completed: false,
                    game_id: created.id as string,
                    user_id: created.user_id,
                    step: GameStateStep.Seed
                })
                .then(() => created)
        );
    }

    async getByUserId(userId: string): Promise<Game[]> {
        return this.gameRepository.getByUserId(userId);
    }

    async getByUserIdAndId(userId: string, id: string): Promise<Game | undefined> {
        return this.gameRepository.getByUserIdAndId(userId, id);
    }

    async updateStateSeed(gameId: string, answers: SeedAnswer): Promise<void> {
        return this.gameRepository
            .getById(gameId)
            .then(game => game || Promise.reject(new BusinessError(ErrorCode.E004, 'Game not found')))
            .then(game =>
                this.state.getGameState(game)
                    .then(state => this.checkState(state, game, GameStateStep.Seed))
                    .then(() => game)
            )
            .then(game =>
                this.gameRepository.updateStateSeed(game.user_id, gameId, answers).then(state => ({ state, game }))
            )
            // .then(({ state, game }) =>
            //     state.applied >= game.nb_players
            //         ? this.gameRepository.completeState(state)
            //             .then(() => this.gameRepository.createState({
            //                 applied: 0,
            //                 total: game.nb_teams,
            //                 completed: false,
            //                 game_id: game.id as string,
            //                 user_id: game.user_id,
            //                 step: GameStateStep.Group
            //             }))
            //         .then(() => this.seed.generate(state))
            //         : undefined
            // )
            .then(() => undefined);
    }

    // async addGroup(gameId: string, groupId: string, data: PutGroupPayload): Promise<void> {
    //     return this.gameRepository
    //         .getById(gameId)
    //         .then(game => game || Promise.reject(new BusinessError(ErrorCode.E004, 'Game not found')))
    //         .then(game =>
    //             this.getCurrentStateByGame(game)
    //                 .then(state => this.checkState(state, game, GameStateStep.Group))
    //                 .then(() => game)
    //         )
    //         .then(game =>
    //             this.gameRepository.updateStateGroup(game.user_id, gameId).then(state => ({ state, game }))
    //             .then(({ state, game }) => this.gameRepository.upsertGroup(game.user_id, game.id as string, groupId, data)
    //             .then(() => ({ state, game })))
    //         )
    //         .then(({ state, game }) =>
    //             state.applied >= game.nb_teams
    //                 ? this.gameRepository.completeState(state).then(() => 0)
    //                 : undefined
    //         )
    //         .then(() => undefined);
    // }

    // async getCurrentStateByGame(game: Game): Promise<GameState | undefined> {
    //     return this.gameRepository
    //         .getStatesByGame(game)
    //         .then(states => states.find(state => state.completed === false));
    // }

    private checkState(state: GameState | undefined, game: Game, step: GameStateStep): GameState {
        if (state?.step === step && state.applied < state.total) {
            return state;
        }
        throw new BusinessError(ErrorCode.E005, `State check failed for the game [${game.id}, ${step}]`);
    }
}
