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
import { AuthHeader } from '../../../models/api/common.model';
import { SpacePathId, SpacePictureResponse, UploadPayload } from '../../../models/api/space.model';
import { SpaceService } from '../../../services/space.service';
import { UserService } from '../../../services/user.service';
import { BusinessError, BusinessErrorResponse, ErrorCode } from '../../../utils';

@Lambda({
    providers: [UserService, SpaceService]
})
export class PictureSpaceLambda {
    constructor(private user: UserService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(SpacePictureResponse)
    async onHandler(
        @Headers headers: AuthHeader,
        @PathParams data: SpacePathId,
        @Payload payload: UploadPayload
    ): Promise<APIGatewayProxyResponse<SpacePictureResponse | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(user =>
                this.space
                    .isOwner(data.id, user.email)
                    .then(check => (check ? user : Promise.reject(new BusinessError(ErrorCode.E003, `User not owner`))))
            )
            .then(() => this.space.uploadPicture(data.id, payload.mime))
            .then(res => ({ statusCode: 200, body: { url: res } }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(PictureSpaceLambda);
