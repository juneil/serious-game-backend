import {
    APIGatewayProxyResponse,
    ApiResponse,
    Cors,
    generateHandler,
    Headers,
    Lambda,
    Logger,
    PathParams
} from '@ekonoo/lambdi';
import { path } from 'ramda';
import { AuthHeader } from '../../../models/api/common.model';
import { GetPathParam, ListGameResponse } from '../../../models/api/game.model';
import { GameState } from '../../../models/game.model';
import { GameService } from '../../../services/game.service';
import { UserService } from '../../../services/user.service';
import { BusinessError, BusinessErrorResponse, ErrorCode } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [UserService, GameService]
})
export class GameListLambda {
    constructor(private readonly user: UserService, private game: GameService, private readonly logger: Logger) {}

    @Cors('*')
    @ApiResponse(ListGameResponse)
    async onHandler(
        @PathParams path: GetPathParam,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<GameState | undefined | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(() => this.game.getById(path.id))
            .then(game => game || Promise.reject(new BusinessError(ErrorCode.E004, `Game not found [${path.id}]`)))
            .then(game => this.game.getCurrentStateByGame(game))
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(GameListLambda);
