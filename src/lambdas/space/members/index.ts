import {
    APIGatewayProxyResponse,
    ApiResponse,
    generateHandler,
    Headers,
    Lambda,
    Logger,
    PathParams
} from '@ekonoo/lambdi';
import { AuthHeader } from '../../../models/api/common.model';
import { SpacePathId } from '../../../models/api/space.model';
import { ListUserResponse } from '../../../models/api/user.model';
import { AuthService } from '../../../services/auth.service';
import { SpaceService } from '../../../services/space.service';
import { BusinessError, BusinessErrorResponse, ErrorCode } from '../../../utils';

@Lambda({
    providers: [AuthService, SpaceService]
})
export class GetSpaceMembersLambda {
    constructor(private auth: AuthService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(ListUserResponse)
    async onHandler(
        @PathParams data: SpacePathId,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<ListUserResponse | BusinessErrorResponse>> {
        return this.auth
            .isMemberOf(data.id, headers)
            .then(() => this.space.getMembers(data.id))
            .then(res => ({ statusCode: 200, body: { users: res } }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(GetSpaceMembersLambda);
