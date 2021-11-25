import {
    APIGatewayProxyResponse,
    ApiResponse,
    generateHandler,
    Headers,
    Lambda,
    Logger,
    Payload
} from '@ekonoo/lambdi';
import { AuthHeader } from '../../../models/api/common.model';
import { PostSpace } from '../../../models/api/space.model';
import { LoginResponse } from '../../../models/api/user.model';
import { Space } from '../../../models/space.model';
import { SpaceService } from '../../../services/space.service';
import { UserService } from '../../../services/user.service';
import { BusinessError, BusinessErrorResponse } from '../../../utils';

@Lambda({
    providers: [UserService, SpaceService]
})
export class CreateSpaceLambda {
    constructor(private user: UserService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(Space)
    async onHandler(
        @Payload data: PostSpace,
        @Headers headers: AuthHeader
    ): Promise<APIGatewayProxyResponse<Space | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(user =>
                this.space
                    .create({
                        owner_id: user.email,
                        description: data.description,
                        title: data.title
                    })
                    .then(space => this.space.join(space.id as string, user.email, true).then(() => space))
                    .then(space => (this.logger.info(`Space created [${space.id}]`), space))
            )
            .then(res => ({ statusCode: 200, body: res }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(CreateSpaceLambda);
