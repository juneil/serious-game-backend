import { Service } from '@ekonoo/lambdi';
import { DynamoDB } from 'aws-sdk';
import { Molder } from '@ekonoo/models';
import { Company } from '../models/company.model';
import { Game } from '../models/game.model';

@Service()
export class CompanyRepository {
    private readonly TABLE = process.env.TABLE || 'UnknownTable';

    constructor(private readonly dynamo: DynamoDB.DocumentClient) {}

    async create(data: Company, date = Date.now()): Promise<Company> {
        if (!data.id) {
            return Promise.reject(new Error('Cannot create a company without id'));
        }
        const formatedData = {
            ...data,
            PK: `GAME#${data.user_id}`,
            SK: `#DETAIL#${data.game_id}#COMPANY#${data.id}`,
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
            .then(() => Molder.instantiate(Company, formatedData));
    }

    async getByGameAndId(game: Game, id: string): Promise<Company | undefined> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND SK = :sk`,
                ExpressionAttributeValues: {
                    ':pk': `GAME#${game.user_id}`,
                    ':sk': `#DETAIL#${game.id}#COMPANY#${id}`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(r => Molder.instantiate(Company, r)).pop());
    }

    async getByGame(game: Game): Promise<Company[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                ExpressionAttributeValues: {
                    ':pk': `GAME#${game.user_id}`,
                    ':sk': `#DETAIL#${game.id}#COMPANY`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(r => Molder.instantiate(Company, r)));
    }
}
