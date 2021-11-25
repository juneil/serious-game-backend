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
import { ListWallItemResponse, SpacePathId } from '../../../../models/api/space.model';
import { AuthService } from '../../../../services/auth.service';
import { SpaceService } from '../../../../services/space.service';
import { BusinessError, BusinessErrorResponse } from '../../../../utils';

@Lambda({
    providers: [AuthService, SpaceService]
})
export class GetSpaceLambda {
    constructor(private auth: AuthService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(ListWallItemResponse)
    async onHandler(
        @Headers headers: AuthHeader,
        @PathParams path: SpacePathId
    ): Promise<APIGatewayProxyResponse<ListWallItemResponse | BusinessErrorResponse>> {
        return this.auth
            .isMemberOf(path.id, headers)
            .then(() => this.space.getWallItems(path.id))
            .then(res => ({ statusCode: 200, body: { items: res } }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(GetSpaceLambda);
