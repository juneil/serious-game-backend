import {
    APIGatewayProxyResponse,
    ApiResponse,
    generateHandler,
    Headers,
    Lambda,
    Logger,
    PathParams
} from '@ekonoo/lambdi';
import { AuthHeader } from '../../../../models/api/common.model';
import { ListWallItemCommentsResponse, SpaceWallPathId } from '../../../../models/api/space.model';
import { AuthService } from '../../../../services/auth.service';
import { SpaceService } from '../../../../services/space.service';
import { BusinessError, BusinessErrorResponse } from '../../../../utils';

@Lambda({
    providers: [AuthService, SpaceService]
})
export class GetSpaceLambda {
    constructor(private auth: AuthService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(ListWallItemCommentsResponse)
    async onHandler(
        @Headers headers: AuthHeader,
        @PathParams path: SpaceWallPathId
    ): Promise<APIGatewayProxyResponse<ListWallItemCommentsResponse | BusinessErrorResponse>> {
        return this.auth
            .isMemberOf(path.id, headers)
            .then(() => this.space.getComments(path.id, path.item_id))
            .then(res => ({ statusCode: 200, body: { comments: res } }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(GetSpaceLambda);
