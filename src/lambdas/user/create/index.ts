import { APIGatewayProxyResponse, ApiResponse, generateHandler, Lambda, Logger, Payload } from '@ekonoo/lambdi';
import { CleanUser, LoginResponse, PostUser } from '../../../models/api/user.model';
import { User, UserProvider } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { BusinessError, BusinessErrorResponse } from '../../../utils';

@Lambda({
    providers: [UserService]
})
export class CreateUserLambda {
    constructor(private readonly user: UserService, private readonly logger: Logger) {}

    @ApiResponse(LoginResponse)
    async onHandler(@Payload data: PostUser): Promise<APIGatewayProxyResponse<LoginResponse | BusinessErrorResponse>> {
        return this.user
            .create({
                avatar: 'none',
                email: data.email,
                name: data.name,
                provider: UserProvider.Internal,
                password: data.password
            })
            .then(user => (this.logger.info(`User created [${user.id}]`), user))
            .then(user => this.user.login(user.email, data.password))
            .then(res => ({ statusCode: 200, body: res }))
            .catch(err => {
                const e = BusinessError.wrap(err);
                this.logger.error(e);
                return { statusCode: e.http_code, body: e.toResponse() };
            });
    }
}

export const handler = generateHandler(CreateUserLambda);
