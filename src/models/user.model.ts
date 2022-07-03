import { Enum, ExtendRules, Pattern, Required } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum UserProvider {
    Internal = 'INTERNAL'
}

@ExtendRules(PersistentEntity)
export class User extends PersistentEntity {
    @Required @Enum(...Object.values(UserProvider)) provider: UserProvider;
    @Required @Pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$') email: string;
    @Required name: string;
    @Required password: string;
}

export class PostLogin {
    @Required email: string;
    @Required password: string;
}

@ExtendRules(PersistentEntity)
export class CleanUser extends PersistentEntity {
    @Required email: string;
    @Required name: string;
}

export class LoginResponse {
    @Required user: CleanUser;
    @Required token: string;
}
