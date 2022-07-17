import {
    ApiResponse,
    generateHandler,
    Lambda,
    Logger,
    Payload,
    APIGatewayProxyResponse,
    Cors,
    Event
} from '@ekonoo/lambdi';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { LoginResponse, PostLogin } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [UserService]
})
export class LoginLambda {
    constructor(private readonly user: UserService, private logger: Logger) {}

    @Cors('*')
    @ApiResponse(LoginResponse)
    async onHandler(
        @Payload data: PostLogin,
        @Event event: APIGatewayProxyEvent
    ): Promise<APIGatewayProxyResponse<LoginResponse | BusinessErrorResponse>> {
        return this.user
            .login(data.email, data.password, event.queryStringParameters?.company_id)
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(LoginLambda);
