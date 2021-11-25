import { Enum, ExtendRules, Item, Max, Min, Required, Simple } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum WallItemType {
    Normal = 'IMG',
    Tree = 'TREE',
    Candle = 'CANDLE',
    Star = 'STAR'
}

@ExtendRules(PersistentEntity)
export class WallItem extends PersistentEntity {
    @Required space_id: string;
    @Required author_id: string;
    @Required @Enum(...Object.values(WallItemType)) type: WallItemType;
    @Simple media?: string;
    @Simple @Max(250) description?: string;
    @Required likes: number;
    @Required comments: number;
}

export class LikeWallItem {
    @Required space_id: string;
    @Required user_id: string;
    @Required item_id: string;
}

@ExtendRules(PersistentEntity)
export class WallItemComment extends PersistentEntity {
    @Required space_id: string;
    @Required item_id: string;
    @Required author_id: string;
    @Required @Min(1) @Max(250) text: string;
}
