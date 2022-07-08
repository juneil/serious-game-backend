import { APIGatewayProxyResponse, ApiResponse, Cors, generateHandler, Lambda, Logger } from '@ekonoo/lambdi';
import { ListScenarioResponse } from '../../../models/scenario.model';
import { ScenarioService } from '../../../services/scenario.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [ScenarioService]
})
export class ScenarioListLambda {
    constructor(
        private readonly scenario: ScenarioService,
        private readonly logger: Logger
    ) {}

    @Cors('*')
    @ApiResponse(ListScenarioResponse)
    async onHandler(): Promise<APIGatewayProxyResponse<ListScenarioResponse | BusinessErrorResponse>> {
        return this.scenario
            .getAllNames()
            .then(res => createResponse({ list: res }))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(ScenarioListLambda);
