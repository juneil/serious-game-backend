import { Service, Inject } from '@ekonoo/lambdi';
import { Provider } from 'lambdi';
import { Game, GameState, GameStateStep } from '../models/game.model';
import { GameRepository } from '../repositories/game.repository';
import { BusinessError, ErrorCode } from '../utils/error';
import { CompanyService } from './company.service';
import { ScenarioService } from './scenario.service';
import { BaseStateService } from './states/base-state.service';
import { GroupStateService } from './states/group.service';
import { RoundPart1StateService } from './states/part1.service';
import { SeedStateService } from './states/seed.service';

const STATES = [SeedStateService, GroupStateService, RoundPart1StateService];

@Service({
    providers: [
        ...STATES.map(
            svc =>
                ({
                    provide: BaseStateService,
                    useClass: svc,
                    multi: true
                } as Provider & { multi: boolean })
        ),
        GameRepository,
        CompanyService,
        ScenarioService
    ]
})
export class GameService {
    constructor(
        @Inject(BaseStateService)
        private services: BaseStateService<GameState, unknown>[],
        private gameRepository: GameRepository,
        private scenario: ScenarioService
    ) {}

    async create(game: Game): Promise<Game> {
        return this.scenario
            .getAllNames()
            .then(res =>
                res.find(s => s.id === game.scenario_id)
                    ? true
                    : Promise.reject(new BusinessError(ErrorCode.BadRequest, 'Scenario not found'))
            )
            .then(() =>
                this.gameRepository.create(game).then(created =>
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
                )
            );
    }

    async getById(id: string): Promise<Game | undefined> {
        return this.gameRepository.getById(id);
    }

    async getByUserId(userId: string): Promise<Game[]> {
        return this.gameRepository.getByUserId(userId);
    }

    async getByUserIdAndId(userId: string, id: string): Promise<Game | undefined> {
        return this.gameRepository.getByUserIdAndId(userId, id);
    }

    async getGameState(game: Game): Promise<GameState> {
        return this.gameRepository
            .getStatesByGame(game)
            .then(states => states.filter(state => !state.completed))
            .then(states =>
                states.length === 1
                    ? (states.pop() as GameState)
                    : Promise.reject(
                          new BusinessError(
                              ErrorCode.InternalServerError,
                              'Cannot have multiple uncompleted states'
                          )
                      )
            );
    }

    async getSeedByRound(state: GameState, round: number): Promise<unknown[]> {
        return this.gameRepository.getSeed(state, round);
    }

    async getGameStates(game: Game, strict = true): Promise<GameState[]> {
        return this.gameRepository.getStatesByGame(game, strict);
    }

    async updateState(
        type: GameStateStep,
        gameId: string,
        payload: unknown
    ): Promise<GameState | undefined> {
        return this.gameRepository
            .getById(gameId)
            .then(
                game =>
                    game ||
                    Promise.reject(new BusinessError(ErrorCode.GameNotFound, 'Game not found'))
            )
            .then(game => this.getGameState(game).then(state => ({ game, state })))
            .then(({ game, state }) => this.getServiceByType(type).update(game, state, payload));
    }

    private getServiceByType(type: GameStateStep): BaseStateService<GameState, unknown> {
        const svc = this.services.find(svc => svc.type === type);
        if (!svc) {
            throw new BusinessError(ErrorCode.UnrecognizedState, `Unrecognized state ${type}`);
        }
        return svc;
    }
}
