import { APIGatewayProxyResponse, ApiResponse, Cors, generateHandler, Lambda, Logger, PathParams } from '@ekonoo/lambdi';
import { GetPathWithRoundParam } from '../../../models/common.model';
import { ListScenarioFundsResponse } from '../../../models/scenario.model';
import { ScenarioService } from '../../../services/scenario.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [ScenarioService]
})
export class ScenarioFundsLambda {
    constructor(
        private readonly scenario: ScenarioService,
        private readonly logger: Logger
    ) {}

    @Cors('*')
    @ApiResponse(ListScenarioFundsResponse)
    async onHandler(
        @PathParams path: GetPathWithRoundParam
    ): Promise<APIGatewayProxyResponse<ListScenarioFundsResponse | BusinessErrorResponse>> {
        return this.scenario
            .getFundsByIdAndRound(path.id, parseInt(path.round))
            .then(res => createResponse({ list: res }))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(ScenarioFundsLambda);
