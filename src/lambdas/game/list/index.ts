import { APIGatewayProxyResponse, ApiResponse, generateHandler, Headers, Lambda, Logger } from '@ekonoo/lambdi';
import { AuthHeader } from '../../../models/api/common.model';
import { ListGameResponse } from '../../../models/api/game.model';
import { GameService } from '../../../services/game.service';
import { UserService } from '../../../services/user.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [UserService, GameService]
})
export class GameListLambda {
    constructor(private readonly user: UserService, private game: GameService, private readonly logger: Logger) {}

    @ApiResponse(ListGameResponse)
    async onHandler(
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<ListGameResponse | BusinessErrorResponse>> {
        return this.user.verify(headers.Authorization).then(user =>
            this.game
                .getByUserId(user.id as string)
                .then(game => (this.logger.info(`Game created [${user.id}]`), game))
                .then(res => createResponse({ games: res }))
                .catch(err => createErrorResponse(err, this.logger))
        );
    }
}

export const handler = generateHandler(GameListLambda);
