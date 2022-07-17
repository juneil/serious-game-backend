import {
    APIGatewayProxyResponse,
    Cors,
    generateHandler,
    Headers,
    Lambda,
    Logger,
    PathParams,
    Payload
} from '@ekonoo/lambdi';
import { AuthHeader, GetPathParam } from '../../../models/common.model';
import { GameStateStep, RoundP1Answer } from '../../../models/game.model';
import { GameService } from '../../../services/game.service';
import { UserService } from '../../../services/user.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [UserService, GameService]
})
export class GameRoundP1Lambda {
    constructor(
        private readonly user: UserService,
        private game: GameService,
        private readonly logger: Logger
    ) {}

    @Cors('*')
    async onHandler(
        @PathParams path: GetPathParam,
        @Headers headers: AuthHeader,
        @Payload data: RoundP1Answer
    ): Promise<APIGatewayProxyResponse<void | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(() => this.game.updateState(GameStateStep.RoundP1, path.id, data))
            .then(() => createResponse(undefined))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(GameRoundP1Lambda);
