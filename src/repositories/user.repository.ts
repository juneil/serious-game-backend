import { Service } from '@ekonoo/lambdi';
import { DynamoDB } from 'aws-sdk';
import { User } from '../models/user.model';
import { Molder } from '@ekonoo/models';
import { generateId } from '../utils';

@Service()
export class UserRepository {
    private readonly TABLE = process.env.TABLE || 'UnknownTable';

    constructor(private readonly dynamo: DynamoDB.DocumentClient) {}

    async create(user: User, date = Date.now()): Promise<User> {
        const id = generateId();
        const data = {
            ...user,
            PK: `USER#${user.email}`,
            SK: `#`,
            id,
            updated_date: date,
            created_date: date
        };
        return this.dynamo
            .put({
                TableName: this.TABLE,
                ConditionExpression: 'attribute_not_exists(PK)',
                Item: data
            })
            .promise()
            .then(() => Molder.instantiate(User, data));
    }

    async getByEmail(email: string): Promise<User | undefined> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND SK = :sk`,
                ExpressionAttributeValues: {
                    ':pk': `USER#${email}`,
                    ':sk': '#'
                }
            })
            .promise()
            .then(res => (res.Items || []).pop())
            .then(res => (res ? Molder.instantiate(User, res) : res));
    }
}
