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
import { Space } from '../../../models/space.model';
import { SpaceService } from '../../../services/space.service';
import { UserService } from '../../../services/user.service';
import { BusinessError, BusinessErrorResponse, ErrorCode } from '../../../utils';

@Lambda({
    providers: [UserService, SpaceService]
})
export class GetSpaceLambda {
    constructor(private user: UserService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(Space)
    async onHandler(
        @PathParams data: SpacePathId,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<Space | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(user =>
                this.space
                    .isMember(data.id, user.email)
                    .then(res => (res ? user : Promise.reject(new BusinessError(ErrorCode.E003, 'User not member'))))
            )
            .then(() => this.space.getById(data.id))
            .then(space => (space ? space : Promise.reject(new BusinessError(ErrorCode.E002, 'Space not found'))))
            .then(res => ({ statusCode: 200, body: res }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(GetSpaceLambda);
