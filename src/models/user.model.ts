import { Enum, ExtendRules, Pattern, Required, Simple } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum UserProvider {
    Facebook = 'FACEBOOK',
    Twitter = 'TWITTER',
    Internal = 'INTERNAL'
}

@ExtendRules(PersistentEntity)
export class User extends PersistentEntity {
    @Required @Enum(...Object.values(UserProvider)) provider: UserProvider;
    @Required @Pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$') email: string;
    @Required name: string;
    @Required avatar: string;
    @Required password: string;
}
