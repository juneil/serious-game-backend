// import { APIGatewayProxyResponse, Cors, generateHandler, Lambda, Logger, PathParams, Payload } from '@ekonoo/lambdi';
// import { GetPathParam, PostAppendSeed } from '../../../models/api/game.model';
// import { GameService } from '../../../services/game.service';
// import { BusinessErrorResponse } from '../../../utils/error';
// import { createErrorResponse, createResponse } from '../../../utils/response';

// @Lambda({
//     providers: [GameService]
// })
// export class GameAppendSeedLambda {
//     constructor(private game: GameService, private readonly logger: Logger) {}

//     @Cors('*')
//     async onHandler(
//         @PathParams path: GetPathParam,
//         @Payload payload: PostAppendSeed
//     ): Promise<APIGatewayProxyResponse<void | BusinessErrorResponse>> {
//         return this.game
//             .updateStateSeed(path.id, payload.answers)
//             .then(res => createResponse(res))
//             .catch(err => createErrorResponse(err, this.logger));
//     }
// }

// export const handler = generateHandler(GameAppendSeedLambda);
