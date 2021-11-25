import { Service } from '@ekonoo/lambdi';
import { DynamoDB } from 'aws-sdk';
import { Molder } from '@ekonoo/models';
import { generateId } from '../utils';
import { Space, SpaceUser } from '../models/space.model';
import { LikeWallItem, WallItem, WallItemComment } from '../models/wall.model';

@Service()
export class WallRepository {
    private readonly TABLE = process.env.TABLE || 'UnknownTable';

    constructor(private readonly dynamo: DynamoDB.DocumentClient) {}

    async create(data: WallItem, date = Date.now()): Promise<WallItem> {
        const id = generateId();
        const item = {
            ...data,
            PK: `SPACE#${data.space_id}`,
            SK: `#WALL#${id}`,
            id,
            updated_date: date,
            created_date: date
        };
        return this.dynamo
            .put({
                TableName: this.TABLE,
                Item: item
            })
            .promise()
            .then(() => Molder.instantiate(WallItem, item));
    }

    async getById(id: string, itemId: string): Promise<WallItem | undefined> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND SK = :sk`,
                ExpressionAttributeValues: {
                    ':pk': `SPACE#${id}`,
                    ':sk': `#WALL#${itemId}`
                }
            })
            .promise()
            .then(res => (res.Items || []).pop())
            .then(res => (res ? Molder.instantiate(WallItem, res) : res));
    }

    async getItems(spaceId: string): Promise<WallItem[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                ExpressionAttributeValues: {
                    ':pk': `SPACE#${spaceId}`,
                    ':sk': '#WALL#'
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(item => Molder.instantiate(WallItem, item)));
    }

    async addPicture(id: string, wallItemId: string): Promise<WallItem> {
        return this.dynamo
            .update({
                TableName: this.TABLE,
                ReturnValues: 'ALL_NEW',
                Key: {
                    PK: `SPACE#${id}`,
                    SK: `#WALL#${wallItemId}`
                },
                UpdateExpression: `SET media = :id`,
                ExpressionAttributeValues: {
                    ':id': wallItemId
                }
            })
            .promise()
            .then(res => Molder.instantiate(WallItem, res.Attributes));
    }

    async comment(data: WallItemComment, date = Date.now()): Promise<WallItemComment> {
        const id = generateId();
        const item = {
            ...data,
            PK: `SPACE#${data.space_id}`,
            SK: `#WALL-COMMENT#${data.item_id}#${id}`,
            id,
            updated_date: date,
            created_date: date
        };
        return this.dynamo
            .put({
                TableName: this.TABLE,
                Item: item
            })
            .promise()
            .then(() => Molder.instantiate(WallItemComment, item));
    }

    async getComments(spaceId: string, wallItemId: string): Promise<WallItemComment[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                ExpressionAttributeValues: {
                    ':pk': `SPACE#${spaceId}`,
                    ':sk': `#WALL-COMMENT#${wallItemId}`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(item => Molder.instantiate(WallItemComment, item)));
    }

    async like(id: string, wallItemId: string, userId: string): Promise<LikeWallItem> {
        const item = {
            space_id: id,
            item_id: wallItemId,
            user_id: userId,
            PK: `SPACE#${id}`,
            SK: `#WALL-LIKE#${wallItemId}#${userId}`
        };
        return this.dynamo
            .put({
                TableName: this.TABLE,
                Item: item,
                ConditionExpression: 'attribute_not_exists(SK)'
            })
            .promise()
            .then(() => this.updateLike(id, wallItemId))
            .catch((e: Error) => {
                if (e.name === 'ConditionalCheckFailedException') {
                    return null;
                }
                throw e;
            })
            .then(() => Molder.instantiate(LikeWallItem, item));
    }

    async unlike(id: string, wallItemId: string, userId: string): Promise<void> {
        return this.dynamo
            .delete({
                ReturnValues: 'ALL_OLD',
                TableName: this.TABLE,
                Key: {
                    PK: `SPACE#${id}`,
                    SK: `#WALL-LIKE#${wallItemId}#${userId}`
                }
            })
            .promise()
            .then(res => (res.Attributes ? this.updateLike(id, wallItemId, true) : null))
            .then(() => undefined);
    }

    async updateLike(id: string, wallItemId: string, decr = false): Promise<WallItem> {
        const exp = decr ? `SET likes = likes - :inc` : `SET likes = likes + :inc`;
        return this.dynamo
            .update({
                TableName: this.TABLE,
                ReturnValues: 'ALL_NEW',
                Key: {
                    PK: `SPACE#${id}`,
                    SK: `#WALL#${wallItemId}`
                },
                UpdateExpression: exp,
                ExpressionAttributeValues: {
                    ':inc': 1
                }
            })
            .promise()
            .then(res => Molder.instantiate(WallItem, res.Attributes));
    }

    async updateComment(id: string, wallItemId: string, decr = false): Promise<WallItem> {
        const exp = decr ? `SET comments = comments - :inc` : `SET comments = comments + :inc`;
        return this.dynamo
            .update({
                TableName: this.TABLE,
                ReturnValues: 'ALL_NEW',
                Key: {
                    PK: `SPACE#${id}`,
                    SK: `#WALL#${wallItemId}`
                },
                UpdateExpression: exp,
                ExpressionAttributeValues: {
                    ':inc': 1
                }
            })
            .promise()
            .then(res => Molder.instantiate(WallItem, res.Attributes));
    }
}
