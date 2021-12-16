import { ApiResponse, generateHandler, Lambda, Logger, Payload, APIGatewayProxyResponse, Cors } from '@ekonoo/lambdi';
import { LoginResponse, PostLogin } from '../../../models/api/user.model';
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
    async onHandler(@Payload data: PostLogin): Promise<APIGatewayProxyResponse<LoginResponse | BusinessErrorResponse>> {
        return this.user
            .login(data.email, data.password)
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(LoginLambda);
