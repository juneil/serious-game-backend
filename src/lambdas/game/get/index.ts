import {
    APIGatewayProxyResponse,
    ApiResponse,
    Cors,
    generateHandler,
    Lambda,
    Logger,
    PathParams
} from '@ekonoo/lambdi';
import { GetPathParam } from '../../../models/api/game.model';
import { Game } from '../../../models/game.model';
import { GameService } from '../../../services/game.service';
import { BusinessError, BusinessErrorResponse, ErrorCode } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [GameService]
})
export class GameListLambda {
    constructor(private game: GameService, private readonly logger: Logger) {}

    @Cors('*')
    @ApiResponse(Game)
    async onHandler(@PathParams path: GetPathParam): Promise<APIGatewayProxyResponse<Game | BusinessErrorResponse>> {
        return this.game
            .getById(path.id)
            .then(game => game || Promise.reject(new BusinessError(ErrorCode.E004, `Game not found [${path.id}]`)))
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(GameListLambda);
