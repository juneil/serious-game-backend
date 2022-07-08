import { Service } from '@ekonoo/lambdi';
import { DynamoDB } from 'aws-sdk';
import { Molder } from '@ekonoo/models';
import { Scenario, ScenarioFunds, ScenarioLight } from '../models/scenario.model';

@Service()
export class ScenarioRepository {
    private readonly TABLE = process.env.TABLE || 'UnknownTable';

    constructor(private readonly dynamo: DynamoDB.DocumentClient) {}

    // async create(data: Game, date = Date.now()): Promise<Game> {
    //     const id = generateId();
    //     const formatedData = {
    //         ...data,
    //         PK: `GAME#${data.user_id}`,
    //         SK: `#DETAIL#${id}`,
    //         id,
    //         updated_date: date,
    //         created_date: date
    //     };
    //     return this.dynamo
    //         .put({
    //             TableName: this.TABLE,
    //             ConditionExpression: 'attribute_not_exists(PK)',
    //             Item: formatedData
    //         })
    //         .promise()
    //         .then(() => Molder.instantiate(Game, formatedData));
    // }

    async getAll(): Promise<ScenarioLight[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                ExpressionAttributeValues: {
                    ':pk': `SCENARIO`,
                    ':sk': '#'
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(r => Molder.instantiate(ScenarioLight, r)));
    }

    async getFundsByIdAndRound(id: string, round: number): Promise<ScenarioFunds[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND SK = :sk`,
                ExpressionAttributeValues: {
                    ':pk': `SCENARIO`,
                    ':sk': `#DETAIL#${id}`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res
                .map(r => Molder.instantiate(Scenario, r))
                .map(sc => ({ ...sc, funds: sc.funds.map(f => ({
                        ...f,
                        nav: f.nav[round - 1] ?? 0
                    })
                )}))
                .map(sc => Molder.instantiate(ScenarioFunds, sc))
            );
    }

    async getById(id: string): Promise<Scenario | undefined> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND SK = :sk`,
                ExpressionAttributeValues: {
                    ':pk': `SCENARIO`,
                    ':sk': `#DETAIL#${id}`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => res.map(r => Molder.instantiate(Scenario, r)).pop());
    }
}
