// import { APIGatewayProxyResponse, Cors, generateHandler, Lambda, Logger, PathParams, Payload } from '@ekonoo/lambdi';
// import { GetPathParam } from '../../../models/common.model';
// import { SeedAnswer } from '../../../models/game.model';
// import { GameService } from '../../../services/game.service';
// import { BusinessErrorResponse } from '../../../utils/error';
// import { createErrorResponse, createResponse } from '../../../utils/response';

// @Lambda({
//     providers: [GameService]
// })
// export class GameSeedLambda {
//     constructor(private game: GameService, private readonly logger: Logger) {}

//     @Cors('*')
//     async onHandler(
//         @PathParams path: GetPathParam,
//         @Payload payload: SeedAnswer
//     ): Promise<APIGatewayProxyResponse<void | BusinessErrorResponse>> {
//         return this.game
//             .updateStateSeed(path.id, payload)
//             .then(res => createResponse(res))
//             .catch(err => createErrorResponse(err, this.logger));
//     }
// }

// export const handler = generateHandler(GameSeedLambda);
