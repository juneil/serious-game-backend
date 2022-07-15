import { generateHandler, Lambda, Logger, APIGatewayProxyResponse, Cors, PathParams } from '@ekonoo/lambdi';
import { GetPath2Params, GetPathParam } from '../../../models/common.model';
import { GameService } from '../../../services/game.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [GameService]
})
export class RawReportLambda {
    constructor(private readonly game: GameService, private logger: Logger) {}

    @Cors('*')
    async onHandler(@PathParams data: GetPathParam):
        Promise<APIGatewayProxyResponse<any | BusinessErrorResponse>> {

            return this.game
                .getById(data.id)
                .then(game => game
                    ? this.game.getGameStates(game).then(states => ({ game, states }))
                    : {}
                )
                .then(res => createResponse(res))
                .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(RawReportLambda);