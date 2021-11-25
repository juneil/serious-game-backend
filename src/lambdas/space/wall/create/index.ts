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
import { CreateWalletItemResponse, PostWalletItem, SpacePathId } from '../../../../models/api/space.model';
import { AuthService } from '../../../../services/auth.service';
import { SpaceService } from '../../../../services/space.service';
import { BusinessError, BusinessErrorResponse } from '../../../../utils';

@Lambda({
    providers: [AuthService, SpaceService]
})
export class CreateWallItemLambda {
    constructor(private auth: AuthService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(CreateWalletItemResponse)
    async onHandler(
        @PathParams path: SpacePathId,
        @Payload data: PostWalletItem,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<CreateWalletItemResponse | BusinessErrorResponse>> {
        return this.auth
            .isMemberOf(path.id, headers)
            .then(user =>
                this.space
                    .addWallItem({
                        space_id: path.id,
                        author_id: user.email,
                        description: data.description,
                        type: data.type,
                        comments: 0,
                        likes: 0
                    })
                    .then(item =>
                        this.space
                            .uploadMedia(path.id, item.id as string, data.mime)
                            .then(url => ({ item, media_url: url }))
                    )
            )
            .then(res => ({ statusCode: 200, body: res }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(CreateWallItemLambda);
