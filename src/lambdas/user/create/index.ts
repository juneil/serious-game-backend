import { APIGatewayProxyResponse, ApiResponse, generateHandler, Lambda, Logger, Payload } from '@ekonoo/lambdi';
import { LoginResponse, PostUser } from '../../../models/api/user.model';
import { UserProvider } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { BusinessErrorResponse } from '../../../utils/error';
import { createErrorResponse, createResponse } from '../../../utils/response';

@Lambda({
    providers: [UserService]
})
export class CreateUserLambda {
    constructor(private readonly user: UserService, private readonly logger: Logger) {}

    @ApiResponse(LoginResponse)
    async onHandler(@Payload data: PostUser): Promise<APIGatewayProxyResponse<LoginResponse | BusinessErrorResponse>> {
        return this.user
            .create({
                email: data.email,
                name: data.name,
                provider: UserProvider.Internal,
                password: data.password
            })
            .then(user => (this.logger.info(`User created [${user.id}]`), user))
            .then(user => this.user.login(user.email, data.password))
            .then(res => createResponse(res))
            .catch(err => createErrorResponse(err, this.logger));
    }
}

export const handler = generateHandler(CreateUserLambda);
