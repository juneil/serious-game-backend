import {
    APIGatewayProxyResponse,
    ApiResponse,
    generateHandler,
    Headers,
    Lambda,
    Logger,
    PathParams,
    Payload
} from '@ekonoo/lambdi';
import { AuthHeader } from '../../../../models/api/common.model';
import { PostWalletItemComment, SpaceWallPathId } from '../../../../models/api/space.model';
import { WallItemComment } from '../../../../models/wall.model';
import { AuthService } from '../../../../services/auth.service';
import { SpaceService } from '../../../../services/space.service';
import { BusinessError, BusinessErrorResponse } from '../../../../utils';

@Lambda({
    providers: [AuthService, SpaceService]
})
export class CommentWallItemLambda {
    constructor(private auth: AuthService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(WallItemComment)
    async onHandler(
        @PathParams path: SpaceWallPathId,
        @Payload data: PostWalletItemComment,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<WallItemComment | BusinessErrorResponse>> {
        return this.auth
            .isMemberOf(path.id, headers)
            .then(user =>
                this.space.addComment({
                    space_id: path.id,
                    item_id: path.item_id,
                    author_id: user.email,
                    text: data.text
                })
            )
            .then(res => ({ statusCode: 200, body: res }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(CommentWallItemLambda);
