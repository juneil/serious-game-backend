import { APIGatewayProxyResponse, ApiResponse, generateHandler, Headers, Lambda, Logger } from '@ekonoo/lambdi';
import { AuthHeader } from '../../../models/api/common.model';
import { ListSpaceResponse } from '../../../models/api/space.model';
import { SpaceService } from '../../../services/space.service';
import { UserService } from '../../../services/user.service';
import { BusinessError, BusinessErrorResponse } from '../../../utils';

@Lambda({
    providers: [UserService, SpaceService]
})
export class GetSpaceLambda {
    constructor(private user: UserService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(ListSpaceResponse)
    async onHandler(
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<ListSpaceResponse | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(user => this.space.getSpacesByEmail(user.email))
            .then(res => ({ statusCode: 200, body: { spaces: res } }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(GetSpaceLambda);
