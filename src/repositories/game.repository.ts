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
            .then(res => res.filter(r => !(r.SK as string).includes('STATE')).map(r => Molder.instantiate(Game, r)));
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
            .then(res => res.length ? Molder.instantiate(Game, res.pop()) : undefined);
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

    // async createState(data: GameState, date = Date.now()): Promise<GameState> {
    //     const formatedData = {
    //         ...data,
    //         PK: `GAME#${data.user_id}`,
    //         SK: `#DETAIL#${data.game_id}#STATE#${data.step}`,
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
    //         .then(() => formatedData);
    // }

    // async getStatesByGame(game: Game): Promise<GameState[]> {
    //     return this.dynamo
    //         .query({
    //             TableName: this.TABLE,
    //             KeyConditionExpression: `PK = :pk AND begins_with(SK, :sk)`,
    //             ExpressionAttributeValues: {
    //                 ':pk': `GAME#${game.user_id}`,
    //                 ':sk': `#DETAIL#${game.id}#STATE`
    //             }
    //         })
    //         .promise()
    //         .then(res => res.Items || [])
    //         .then(res => Molder.instantiate(StatesList, { states: res }))
    //         .then(res => res.states.map(r => r as GameState));
    // }

    // async completeState(state: GameState): Promise<GameState> {
    //     return this.dynamo
    //         .update({
    //             TableName: this.TABLE,
    //             ReturnValues: 'ALL_NEW',
    //             Key: {
    //                 PK: `GAME#${state.user_id}`,
    //                 SK: `#DETAIL#${state.game_id}#STATE#${state.step}`
    //             },
    //             UpdateExpression: `SET completed = true`,
    //             ExpressionAttributeValues: {}
    //         })
    //         .promise()
    //         .then(res => res.Attributes as GameState);
    // }

    // async updateStateSeed(userId: string, gameId: string, answers: number[]): Promise<GameStateSeed> {
    //     return this.dynamo
    //         .update({
    //             TableName: this.TABLE,
    //             ReturnValues: 'ALL_NEW',
    //             Key: {
    //                 PK: `GAME#${userId}`,
    //                 SK: `#DETAIL#${gameId}#STATE#${GameStateStep.Seed}`
    //             },
    //             UpdateExpression: `SET applied = applied + :inc, answers = list_append(if_not_exists(answers, :empty_list), :values)`,
    //             ExpressionAttributeValues: {
    //                 ':inc': 1,
    //                 ':empty_list': [],
    //                 ':values': [answers]
    //             }
    //         })
    //         .promise()
    //         .then(res => Molder.instantiate(GameStateSeed, res.Attributes));
    // }

    // async updateStateGroup(userId: string, gameId: string): Promise<GameStateGroup> {
    //     return this.dynamo
    //         .update({
    //             TableName: this.TABLE,
    //             ReturnValues: 'ALL_NEW',
    //             Key: {
    //                 PK: `GAME#${userId}`,
    //                 SK: `#DETAIL#${gameId}#STATE#${GameStateStep.Group}`
    //             },
    //             UpdateExpression: `SET applied = applied + :inc`,
    //             ExpressionAttributeValues: {
    //                 ':inc': 1
    //             }
    //         })
    //         .promise()
    //         .then(res => Molder.instantiate(GameStateSeed, res.Attributes));
    // }

    // async upsertGroup(userId: string, gameId: string, groupId: string, data: GameGroup): Promise<GameGroup> {
    //     return this.dynamo
    //         .put({
    //             TableName: this.TABLE,
    //             ReturnValues: 'ALL_NEW',
    //             Item: {
    //                 ...data,
    //                 id: groupId,
    //                 PK: `GAME#${userId}`,
    //                 SK: `#DETAIL#${gameId}#STATE#${GameStateStep.Group}#${groupId}`
    //             }
    //         })
    //         .promise()
    //         .then(res => Molder.instantiate(GameGroup, res.Attributes));
    // }
}
