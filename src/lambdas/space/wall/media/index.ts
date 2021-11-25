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
import { SpacePictureResponse, SpaceWallPathId, UploadPayload } from '../../../../models/api/space.model';
import { AuthService } from '../../../../services/auth.service';
import { SpaceService } from '../../../../services/space.service';
import { BusinessError, BusinessErrorResponse } from '../../../../utils';

@Lambda({
    providers: [AuthService, SpaceService]
})
export class MediaWallLambda {
    constructor(private auth: AuthService, private readonly space: SpaceService, private readonly logger: Logger) {}

    @ApiResponse(SpacePictureResponse)
    async onHandler(
        @Headers headers: AuthHeader,
        @PathParams data: SpaceWallPathId,
        @Payload payload: UploadPayload
    ): Promise<APIGatewayProxyResponse<SpacePictureResponse | BusinessErrorResponse>> {
        return this.auth
            .isMemberOf(data.id, headers)
            .then(() => this.space.uploadMedia(data.id, data.item_id, payload.mime))
            .then(res => ({ statusCode: 200, body: { url: res } }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(MediaWallLambda);
