import { Enum, ExtendRules, Item, Required } from '@ekonoo/models';
import { PersistentEntity } from '../common.model';
import { User, UserProvider } from '../user.model';

export class PostLogin {
    @Required email: string;
    @Required password: string;
}

export class PostUser {
    @Required email: string;
    @Required name: string;
    @Required password: string;
}

@ExtendRules(PersistentEntity)
export class CleanUser extends PersistentEntity {
    @Required @Enum(...Object.values(UserProvider)) provider: UserProvider;
    @Required email: string;
    @Required name: string;
    @Required avatar: string;
}

export class LoginResponse {
    @Required user: CleanUser;
    @Required token: string;
}

export class ListUserResponse {
    @Required @Item(CleanUser) users: CleanUser[];
}
