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
import { SpacePathGetPicture, SpacePictureResponse } from '../../../models/api/space.model';
import { SpaceService } from '../../../services/space.service';
import { UserService } from '../../../services/user.service';
import { BusinessError, BusinessErrorResponse, ErrorCode } from '../../../utils';

@Lambda({
    providers: [UserService, SpaceService]
})
export class GetPictureSpaceLambda {
    constructor(private user: UserService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(SpacePictureResponse)
    async onHandler(
        @Headers headers: AuthHeader,
        @PathParams data: SpacePathGetPicture
    ): Promise<APIGatewayProxyResponse<SpacePictureResponse | BusinessErrorResponse>> {
        return this.user
            .verify(headers.Authorization)
            .then(user =>
                this.space
                    .isMember(data.id, user.email)
                    .then(check =>
                        check ? user : Promise.reject(new BusinessError(ErrorCode.E003, `User not member`))
                    )
            )
            .then(() => this.space.getPicturesUrl(data.id, data.picture_id))
            .then(res => ({ statusCode: 200, body: { url: res } }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(GetPictureSpaceLambda);
