import { Service } from '@ekonoo/lambdi';
import { Game, GameState, GameStateStep, GroupAnswer, GroupState } from '../../models/game.model';
import { GameRepository } from '../../repositories/game.repository';
import { CompanyService } from '../company.service';
import { BaseStateService } from './base-state.service';

@Service({ providers: [GameRepository, CompanyService] })
export class GroupStateService extends BaseStateService<GroupState, GroupAnswer> {
    public type = GameStateStep.Group;

    constructor(protected gameRepository: GameRepository, private company: CompanyService) {
        super();
    }

    async update(game: Game, state: GroupState, data: GroupAnswer): Promise<GameState> {
        return Promise.resolve(state)
            .then(state => super.checkState(state))
            .then(() =>
                this.gameRepository.updateState(
                    state.user_id,
                    state.game_id as string,
                    this.type,
                    data,
                    GroupState
                )
            )
            .then(state =>
                this.complete(state).then(res =>
                    res
                        ? Promise.all(
                              state.answers.map(answer =>
                                  this.company.create({
                                      id: answer.id,
                                      game_id: game.id as string,
                                      user_id: game.user_id,
                                      name: answer.name,
                                      round_details: [],
                                      score: 0
                                  })
                              )
                          ).then(() => state)
                        : state
                )
            );
    }
}
