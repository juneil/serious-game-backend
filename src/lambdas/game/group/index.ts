import { APIGatewayProxyResponse, Cors, generateHandler, Lambda, Logger, PathParams, Payload } from '@ekonoo/lambdi';
import { GetPathParam } from '../../../models/common.model';
import { GameStateStep } from '../../../models/game.model';
import { GroupAnswer } from '../../../models/group.model';
import { GameService } from '../../../services/game.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [GameService]
})
export class GameSeedLambda {
    constructor(private game: GameService, private readonly logger: Logger) {}

    @Cors('*')
    async onHandler(
        @PathParams path: GetPathParam,
        @Payload payload: GroupAnswer
    ): Promise<APIGatewayProxyResponse<void | BusinessErrorResponse>> {
        return this.game
            .updateState(GameStateStep.Group, path.id, payload)
            .then(() => undefined)
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(GameSeedLambda);
