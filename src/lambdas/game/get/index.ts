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
import { String } from 'aws-sdk/clients/appstream';
import { AuthHeader } from '../../../models/api/common.model';
import { GetPathParam } from '../../../models/api/game.model';
import { Game } from '../../../models/game.model';
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
    @ApiResponse(Game)
    async onHandler(
        @PathParams path: GetPathParam,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<Game | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(user =>
                this.game
                    .getByUserIdAndId(user.id as String, path.id)
                    .then(
                        game => game || Promise.reject(new BusinessError(ErrorCode.E004, `Game not found [${path.id}]`))
                    )
                    .then(game => (this.logger.info(`Game created [${user.id}]`), game))
            )
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(GameListLambda);
