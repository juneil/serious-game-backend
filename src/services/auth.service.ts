import { Service } from '@ekonoo/lambdi';
import { AuthHeader } from '../models/api/common.model';
import { User } from '../models/user.model';
import { BusinessError, ErrorCode } from '../utils';
import { SpaceService } from './space.service';
import { UserService } from './user.service';

@Service({ providers: [SpaceService, UserService] })
export class AuthService {
    constructor(private user: UserService, private readonly space: SpaceService) {}

    async isMemberOf(spaceId: string, headers: AuthHeader): Promise<User> {
        return this.user
            .verify(headers.Authorization)
            .then(user =>
                this.space
                    .isMember(spaceId, user.email)
                    .then(check => (check ? user : Promise.reject(new BusinessError(ErrorCode.E003, 'Not member'))))
            );
    }

    async isOwnerOf(spaceId: string, headers: AuthHeader): Promise<User> {
        return this.user
            .verify(headers.Authorization)
            .then(user =>
                this.space
                    .isOwner(spaceId, user.email)
                    .then(check => (check ? user : Promise.reject(new BusinessError(ErrorCode.E003, 'Not owner'))))
            );
    }
}
