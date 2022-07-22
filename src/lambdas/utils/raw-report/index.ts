import {
    generateHandler,
    Lambda,
    Logger,
    APIGatewayProxyResponse,
    Cors,
    PathParams
} from '@ekonoo/lambdi';
import { GetPathParam } from '../../../models/common.model';
import { CompanyService } from '../../../services/company.service';
import { GameService } from '../../../services/game.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [GameService, CompanyService]
})
export class RawReportLambda {
    constructor(
        private readonly game: GameService,
        private company: CompanyService,
        private logger: Logger
    ) {}

    @Cors('*')
    async onHandler(
        @PathParams data: GetPathParam
    ): Promise<APIGatewayProxyResponse<unknown | BusinessErrorResponse>> {
        return this.game
            .getById(data.id)
            .then(game =>
                game
                    ? this.game
                          .getGameStates(game, false)
                          .then(states =>
                              Promise.all([
                                  this.company.getByGame(game),
                                  this.game.getSeedByRound(states[0], 1)
                              ]).then(([companies, seed]) => ({ game, states, seed, companies }))
                          )
                    : ({} as unknown)
            )
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(RawReportLambda);
