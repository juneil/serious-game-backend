import { Item, Max, Required, Simple } from '@ekonoo/models';
import { Space } from '../space.model';
import { WallItem, WallItemComment, WallItemType } from '../wall.model';

export class PostSpace {
    @Required @Max(100) title: string;
    @Required @Max(200) description: string;
}

export class SpacePathId {
    @Required id: string;
}

export class SpaceWallPathId {
    @Required id: string;
    @Required item_id: string;
}

export class SpacePathGetPicture {
    @Required id: string;
    @Required picture_id: string;
}

export class UploadPayload {
    @Required mime: string;
}

export class SpacePictureResponse {
    @Required url: string;
}

export class ListSpaceResponse {
    @Required @Item(Space) spaces: Space[];
}

export class PostWalletItem {
    @Required @Item(Object.values(WallItemType)) type: WallItemType;
    @Simple @Max(200) description?: string;
    @Required mime: string;
}

export class PostWalletItemComment {
    @Required @Max(250) text: string;
}

export class CreateWalletItemResponse {
    @Required item: WallItem;
    @Required media_url: string;
}

export class ListWallItemResponse {
    @Required @Item(WallItem) items: WallItem[];
}

export class ListWallItemCommentsResponse {
    @Required @Item(WallItemComment) comments: WallItemComment[];
}
