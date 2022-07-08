import { Service } from '@ekonoo/lambdi';
import { Game, GameState, GameStateStep } from '../../models/game.model';
import { GameRepository } from '../../repositories/game.repository';
import { BaseStateService } from './base-state.service';
import { GroupAnswer, GroupState } from '../../models/group.model';

@Service({ providers: [GameRepository] })
export class GroupStateService extends BaseStateService<GroupState, GroupAnswer> {
    public type = GameStateStep.Group;

    constructor(protected gameRepository: GameRepository) {
        super();
    }

    async update(_: Game, state: GroupState, data: GroupAnswer): Promise<GameState> {
        return Promise.resolve(state)
            .then(state => super.checkState(state))
            .then(() =>
                this.gameRepository
                    .updateStateGroup(state.user_id, state.game_id as string, data)
            )
            .then(state => this.complete(state).then(() => state));
    }
}
