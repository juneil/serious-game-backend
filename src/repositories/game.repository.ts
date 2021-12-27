import { Service } from '@ekonoo/lambdi';
import { DynamoDB } from 'aws-sdk';
import { Molder } from '@ekonoo/models';
import { generateId } from '../utils/error';
import { Game } from '../models/game.model';

@Service()
export class GameRepository {
    private readonly TABLE = process.env.TABLE || 'UnknownTable';

    constructor(private readonly dynamo: DynamoDB.DocumentClient) {}

    async create(data: Game, date = Date.now()): Promise<Game> {
        const id = generateId();
        const formatedData = {
            ...data,
            PK: `GAME#${data.user_id}`,
            SK: `#DETAIL#${id}`,
            id,
            updated_date: date,
            created_date: date
        };
        return this.dynamo
            .put({
                TableName: this.TABLE,
                ConditionExpression: 'attribute_not_exists(PK)',
                Item: formatedData
            })
            .promise()
            .then(() => Molder.instantiate(Game, formatedData));
    }

    async getByUserId(id: string): Promise<Game[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                ExpressionAttributeValues: {
                    ':pk': `GAME#${id}`,
                    ':sk': '#'
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(r => Molder.instantiate(Game, r)));
    }

    async getById(id: string): Promise<Game | undefined> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                IndexName: 'GSI1',
                KeyConditionExpression: `SK = :sk AND begins_with(PK, :pk)`,
                ExpressionAttributeValues: {
                    ':pk': `GAME#`,
                    ':sk': `#DETAIL#${id}`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(r => Molder.instantiate(Game, r)).pop());
    }
}
