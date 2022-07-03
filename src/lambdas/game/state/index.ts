import { APIGatewayProxyResponse, Cors, generateHandler, Headers, Lambda, Logger, PathParams } from '@ekonoo/lambdi';
import { AuthHeader, GetPathParam } from '../../../models/common.model';
import { GameState } from '../../../models/game.model';
import { GameService } from '../../../services/game.service';
import { UserService } from '../../../services/user.service';
import { StateService } from '../../../services/state.service';
import { BusinessError, BusinessErrorResponse, ErrorCode } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [UserService, GameService, StateService]
})
export class GameStateLambda {
    constructor(
        private readonly user: UserService,
        private game: GameService,
        private state: StateService,
        private readonly logger: Logger
    ) {}

    @Cors('*')
    async onHandler(
        @PathParams path: GetPathParam,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<GameState | undefined | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(user => this.game.getByUserIdAndId(user.id as string, path.id))
            .then(game => game || Promise.reject(new BusinessError(ErrorCode.E004, `Game not found [${path.id}]`)))
            .then(game => this.state.getGameState(game))
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(GameStateLambda);
