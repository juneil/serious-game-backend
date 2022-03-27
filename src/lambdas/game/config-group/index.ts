import { APIGatewayProxyResponse, Cors, generateHandler, Lambda, Logger, PathParams, Payload } from '@ekonoo/lambdi';
import { PutGroupParam, PutGroupPayload } from '../../../models/api/game.model';
import { GameService } from '../../../services/game.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [GameService]
})
export class GameGroupUpdateLambda {
    constructor(private game: GameService, private readonly logger: Logger) {}

    @Cors('*')
    async onHandler(
        @PathParams path: PutGroupParam,
        @Payload payload: PutGroupPayload
    ): Promise<APIGatewayProxyResponse<void | BusinessErrorResponse>> {
        return this.game
            .addGroup(path.id, path.group, payload)
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(GameGroupUpdateLambda);
