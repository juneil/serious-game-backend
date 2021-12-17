import {
    APIGatewayProxyResponse,
    ApiResponse,
    Cors,
    generateHandler,
    Headers,
    Lambda,
    Logger,
    Payload
} from '@ekonoo/lambdi';
import { AuthHeader } from '../../../models/api/common.model';
import { PostGame } from '../../../models/api/game.model';
import { Game, GameStatus } from '../../../models/game.model';
import { GameService } from '../../../services/game.service';
import { UserService } from '../../../services/user.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [UserService, GameService]
})
export class CreateGameLambda {
    constructor(private readonly user: UserService, private game: GameService, private readonly logger: Logger) {}

    @Cors('*')
    @ApiResponse(Game)
    async onHandler(
        @Payload data: PostGame,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<Game | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(user =>
                this.game
                    .create({ ...data, status: GameStatus.Created, user_id: user.id as string })
                    .then(game => (this.logger.info(`Game created [${user.id}]`), game))
            )
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(CreateGameLambda);
