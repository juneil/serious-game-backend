import { ExtendRules, Item, Max, Required, Simple } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

@ExtendRules(PersistentEntity)
export class Space extends PersistentEntity {
    @Required owner_id: string;
    @Required @Max(100) title: string;
    @Required @Max(200) description: string;
    @Simple picture?: string;
}

@ExtendRules(PersistentEntity)
export class SpaceUser extends PersistentEntity {
    @Required space_id: string;
    @Required user_id: string;
    @Required admin: boolean;
}
