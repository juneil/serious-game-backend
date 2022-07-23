import { Service } from '@ekonoo/lambdi';
import { DynamoDB } from 'aws-sdk';
import { Molder } from '@ekonoo/models';
import { generateId } from '../utils/error';
import {
    Game,
    GameState,
    GameStateStep,
    GroupAnswer,
    GroupState,
    SeedAnswer,
    SeedSensisResult,
    SeedState
} from '../models/game.model';

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
            .then(res =>
                res
                    .filter(r => !(r.SK as string).includes('STATE'))
                    .map(r => Molder.instantiate(Game, r))
            );
    }

    async getByUserIdAndId(userId: string, id: string): Promise<Game | undefined> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND SK = :sk`,
                ExpressionAttributeValues: {
                    ':pk': `GAME#${userId}`,
                    ':sk': `#DETAIL#${id}`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res => (res.length ? Molder.instantiate(Game, res.pop()) : undefined));
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

    async createState(data: GameState, date = Date.now()): Promise<GameState> {
        const formatedData = {
            ...data,
            PK: `GAME#${data.user_id}`,
            SK: `#DETAIL#${data.game_id}#STATE#${data.step}`,
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
            .then(() => Molder.instantiate(GameState, formatedData));
    }

    async getStatesByGame(game: Game, strict = true): Promise<GameState[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                ExpressionAttributeValues: {
                    ':pk': `GAME#${game.user_id}`,
                    ':sk': `#DETAIL#${game.id}#STATE`
                }
            })
            .promise()
            .then(res => res.Items || [])
            .then(res =>
                res.map(r =>
                    strict
                        ? Molder.instantiate(GameState, r)
                        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          ({ ...r, PK: undefined, SK: undefined } as any)
                )
            );
    }

    async completeState(state: GameState): Promise<GameState> {
        return this.dynamo
            .update({
                TableName: this.TABLE,
                ReturnValues: 'ALL_NEW',
                Key: {
                    PK: `GAME#${state.user_id}`,
                    SK: `#DETAIL#${state.game_id}#STATE#${state.step}`
                },
                UpdateExpression: `SET completed = :true`,
                ExpressionAttributeValues: {
                    ':true': true
                }
            })
            .promise()
            .then(res => res.Attributes as GameState);
    }

    async updateState<T extends GameState>(
        userId: string,
        gameId: string,
        step: GameStateStep,
        answers: unknown,
        token: new () => T
    ): Promise<T> {
        return this.dynamo
            .update({
                TableName: this.TABLE,
                ReturnValues: 'ALL_NEW',
                Key: {
                    PK: `GAME#${userId}`,
                    SK: `#DETAIL#${gameId}#STATE#${step}`
                },
                UpdateExpression: `SET applied = applied + :inc, answers = list_append(if_not_exists(answers, :empty_list), :values)`,
                ExpressionAttributeValues: {
                    ':inc': 1,
                    ':empty_list': [],
                    ':values': [answers]
                }
            })
            .promise()
            .then(res => Molder.instantiate(token, res.Attributes));
    }

    async completeStateSeed(
        state: SeedState,
        data: SeedSensisResult,
        regionIndexes: number[],
        ageStd: number
    ): Promise<SeedState> {
        return this.dynamo
            .update({
                TableName: this.TABLE,
                ReturnValues: 'ALL_NEW',
                Key: {
                    PK: `GAME#${state.user_id}`,
                    SK: `#DETAIL#${state.game_id}#STATE#${GameStateStep.Seed}`
                },
                UpdateExpression: `SET sensis = :data, region_indexes = :indexes, age_std = :std`,
                ExpressionAttributeValues: {
                    ':data': data,
                    ':indexes': regionIndexes,
                    ':std': ageStd
                }
            })
            .promise()
            .then(res => Molder.instantiate(SeedState, res.Attributes));
    }

    async createSeed(
        state: GameState,
        round: number,
        data: unknown[],
        date = Date.now()
    ): Promise<unknown[]> {
        const formatedData = {
            data: JSON.stringify(data),
            PK: `GAME#${state.user_id}`,
            SK: `#DETAIL#${state.game_id}#ROUND#${round}#SEED`,
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
            .then(() => data);
    }

    async getSeed(state: GameState, round: number): Promise<unknown[]> {
        return this.dynamo
            .query({
                TableName: this.TABLE,
                KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
                ExpressionAttributeValues: {
                    ':pk': `GAME#${state.user_id}`,
                    ':sk': `#DETAIL#${state.game_id}#ROUND#${round}#SEED`
                }
            })
            .promise()
            .then(res => (res.Items || []).pop())
            .then(res => (res ? JSON.parse(res.data) : []));
    }
}
