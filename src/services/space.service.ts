import { Service } from '@ekonoo/lambdi';
import { cond, equals } from 'ramda';
import { Space } from '../models/space.model';
import { User } from '../models/user.model';
import { LikeWallItem, WallItem, WallItemComment } from '../models/wall.model';
import { PicRepository } from '../repositories/pic.repository';
import { SpaceRepository } from '../repositories/space.repository';
import { UserRepository } from '../repositories/user.repository';
import { WallRepository } from '../repositories/wall.repository';
import { BusinessError, ErrorCode, generateId } from '../utils';

@Service({ providers: [SpaceRepository, PicRepository, UserRepository, WallRepository] })
export class SpaceService {
    constructor(
        private spaceRepository: SpaceRepository,
        private userRepository: UserRepository,
        private picRepository: PicRepository,
        private wallRepository: WallRepository
    ) {}

    async create(user: Space): Promise<Space> {
        return this.spaceRepository.create(user);
    }

    async getById(id: string): Promise<Space | undefined> {
        return this.spaceRepository.getById(id);
    }

    async getSpacesByEmail(email: string): Promise<Space[]> {
        return this.spaceRepository
            .getSpaceUsersByEmail(email)
            .then(links => Promise.all(links.map(link => this.getById(link.space_id))))
            .then(spaces => spaces.filter(Boolean).map(s => s as Space));
    }

    async getMembers(spaceId: string): Promise<User[]> {
        return this.spaceRepository
            .getMembers(spaceId)
            .then(links => Promise.all(links.map(link => this.userRepository.getByEmail(link.user_id))))
            .then(users => users.filter(user => !!user).map(user => user as User));
    }

    async join(id: string, email: string, admin = false): Promise<Space> {
        return this.getById(id)
            .then(space =>
                space ? space : Promise.reject(new BusinessError(ErrorCode.E002, `Space cannot be joined [${id}]`))
            )
            .then(space => this.spaceRepository.addUser(email, id, admin).then(() => space));
    }

    async isOwner(id: string, email: string): Promise<boolean> {
        return this.spaceRepository.getUser(email, id).then(res => res?.admin || false);
    }

    async isMember(id: string, email: string): Promise<boolean> {
        return this.spaceRepository.getUser(email, id).then(res => !!res);
    }

    async uploadPicture(id: string, mime: string): Promise<string> {
        const picId = generateId();
        return this.picRepository.getUploadUrl(`${id}/space/${picId}`, mime);
    }

    async uploadMedia(spaceId: string, wallItemId: string, mime: string): Promise<string> {
        return this.wallRepository
            .getById(spaceId, wallItemId)
            .then(item =>
                !item?.media
                    ? this.picRepository.getUploadUrl(`${spaceId}/media/${wallItemId}`, mime)
                    : Promise.reject(new BusinessError(ErrorCode.E002, 'Media existings'))
            );
    }

    async confirmUpload(id: string, picId: string, type: string): Promise<void> {
        return cond([
            [equals('space'), () => this.spaceRepository.addPicture(id, picId).then(() => undefined)],
            [equals('media'), () => this.wallRepository.addPicture(id, picId).then(() => undefined)]
        ])(type);
    }

    async getPicturesUrl(id: string, pictureId: string): Promise<string> {
        return this.picRepository.getReadUrl(`${id}/space/${pictureId}`);
    }

    async getMediaUrl(id: string, pictureId: string): Promise<string> {
        return this.picRepository.getReadUrl(`${id}/media/${pictureId}`);
    }

    async addWallItem(item: WallItem): Promise<WallItem> {
        return this.wallRepository.create(item);
    }

    async getWallItems(id: string): Promise<WallItem[]> {
        return this.wallRepository
            .getItems(id)
            .then(items => items.filter(item => (item.type === 'IMG' ? !!item.media : true)))
            .then(items =>
                Promise.all(
                    items.map(item =>
                        this.getMediaUrl(item.space_id, item.media as string).then(url => ({ ...item, media: url }))
                    )
                )
            );
    }

    async like(id: string, itemId: string, userId: string): Promise<LikeWallItem> {
        return this.wallRepository.like(id, itemId, userId);
    }

    async unlike(id: string, itemId: string, userId: string): Promise<void> {
        return this.wallRepository.unlike(id, itemId, userId);
    }

    async addComment(data: WallItemComment): Promise<WallItemComment> {
        return this.wallRepository
            .comment(data)
            .then(com => this.wallRepository.updateComment(com.space_id, com.item_id).then(() => com));
    }

    async getComments(spaceId: string, wallItemId: string): Promise<WallItemComment[]> {
        return this.wallRepository.getComments(spaceId, wallItemId);
    }
}
