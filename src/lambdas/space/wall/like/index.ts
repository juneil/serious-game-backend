import { APIGatewayProxyResponse, generateHandler, Headers, Lambda, Logger, PathParams, Payload } from '@ekonoo/lambdi';
import { AuthHeader } from '../../../../models/api/common.model';
import { PostWalletItem, SpaceWallPathId } from '../../../../models/api/space.model';
import { AuthService } from '../../../../services/auth.service';
import { SpaceService } from '../../../../services/space.service';
import { BusinessError, BusinessErrorResponse } from '../../../../utils';

@Lambda({
    providers: [AuthService, SpaceService]
})
export class LikeWallItemLambda {
    constructor(private auth: AuthService, private readonly space: SpaceService, private readonly logger: Logger) {}

    async onHandler(
        @PathParams path: SpaceWallPathId,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<void | BusinessErrorResponse>> {
        return this.auth
            .isMemberOf(path.id, headers)
            .then(user => this.space.like(path.id, path.item_id, user.email))
            .then(() => ({ statusCode: 204, body: undefined }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(LikeWallItemLambda);
