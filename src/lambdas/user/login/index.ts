import { ApiResponse, generateHandler, Lambda, Logger, Payload, APIGatewayProxyResponse } from '@ekonoo/lambdi';
import { LoginResponse, PostLogin, PostUser } from '../../../models/api/user.model';
import { UserService } from '../../../services/user.service';
import { BusinessError, BusinessErrorResponse } from '../../../utils';

@Lambda({
    providers: [UserService]
})
export class LoginLambda {
    constructor(private readonly user: UserService, private logger: Logger) {}

    @ApiResponse(LoginResponse)
    async onHandler(@Payload data: PostLogin): Promise<APIGatewayProxyResponse<LoginResponse | BusinessErrorResponse>> {
        return this.user
            .login(data.email, data.password)
            .then(res => ({
                statusCode: 200,
                body: res
            }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(LoginLambda);
