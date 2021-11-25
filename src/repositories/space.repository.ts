import { Service } from '@ekonoo/lambdi';
import { DynamoDB } from 'aws-sdk';
import { Molder } from '@ekonoo/models';
import { generateId } from '../utils';
import { Space, SpaceUser } from '../models/space.model';

@Service()
export class SpaceRepository {
    private readonly TABLE = process.env.TABLE || 'UnknownTable';

    constructor(private readonly dynamo: DynamoDB.DocumentClient) {}

    async create(data: Space, date = Date.now()): Promise<Space> {
        const id = generateId();
        const item = {
            ...data,
            PK: `SPACE#${id}`,
            SK: `#`,
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
            .then(() => Molder.instantiate(Space, item));
    }

    async getById(id: string): Promise<Space | undefined> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND SK = :sk`,
                ExpressionAttributeValues: {
                    ':pk': `SPACE#${id}`,
                    ':sk': '#'
                }
            })
            .promise()
            .then(res => (res.Items || []).pop())
            .then(res => (res ? Molder.instantiate(Space, res) : res));
    }

    async addPicture(id: string, picId: string): Promise<Space | undefined> {
        return this.dynamo
            .update({
                TableName: this.TABLE,
                ReturnValues: 'ALL_NEW',
                Key: {
                    PK: `SPACE#${id}`,
                    SK: '#'
                },
                UpdateExpression: `SET picture = :pic`,
                ExpressionAttributeValues: {
                    ':pics': picId
                }
            })
            .promise()
            .then(res => Molder.instantiate(Space, res.Attributes));
    }

    async addUser(email: string, spaceId: string, admin: boolean, date = Date.now()): Promise<SpaceUser> {
        const id = generateId();
        const item = {
            PK: `SPACE#${spaceId}`,
            SK: `#USER#${email}`,
            id,
            user_id: email,
            space_id: spaceId,
            admin,
            updated_date: date,
            created_date: date
        };
        return this.dynamo
            .put({
                TableName: this.TABLE,
                Item: item
            })
            .promise()
            .then(() => Molder.instantiate(SpaceUser, item));
    }

    async getUser(email: string, spaceId: string): Promise<SpaceUser | undefined> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND SK = :sk`,
                ExpressionAttributeValues: {
                    ':pk': `SPACE#${spaceId}`,
                    ':sk': `#USER#${email}`
                }
            })
            .promise()
            .then(res => (res.Items || []).pop())
            .then(res => (res ? Molder.instantiate(SpaceUser, res) : res));
    }

    async getMembers(spaceId: string): Promise<SpaceUser[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                ExpressionAttributeValues: {
                    ':pk': `SPACE#${spaceId}`,
                    ':sk': `#USER`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(item => Molder.instantiate(SpaceUser, item)));
    }

    async getSpaceUsersByEmail(email: string): Promise<SpaceUser[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                IndexName: 'GSI1',
                KeyConditionExpression: `SK = :sk AND begins_with(PK, :pk)`,
                ExpressionAttributeValues: {
                    ':pk': `SPACE#`,
                    ':sk': `#USER#${email}`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res?.map(item => Molder.instantiate(SpaceUser, item)));
    }
}
