/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from '@ekonoo/lambdi';
import {
    Game,
    GameState,
    GameStateStep,
    SeedAnswer,
    SeedSensisResult,
    SeedState
} from '../../models/game.model';
import { GameRepository } from '../../repositories/game.repository';
import { BaseStateService } from './base-state.service';
import * as MathJS from 'mathjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Vega = require('vega-statistics');

@Service({ providers: [GameRepository] })
export class SeedStateService extends BaseStateService<SeedState, SeedAnswer> {
    public type = GameStateStep.Seed;
    private baseAmount = 5000;

    constructor(protected gameRepository: GameRepository) {
        super();
    }

    async update(game: Game, state: SeedState, data: SeedAnswer): Promise<GameState> {
        return Promise.resolve(state)
            .then(state => super.checkState(state))
            .then(() =>
                this.gameRepository
                    .updateState(state.user_id, state.game_id as string, this.type, data, SeedState)
                    .then(state => ({ state, game }))
            )
            .then(({ state, game }) =>
                this.complete(state).then(completed =>
                    completed ? this.completeCompute(game, state).then(() => state) : state
                )
            );
    }

    async completeCompute(game: Game, state: SeedState): Promise<void> {
        const values = state.answers.map(a => ({ ...a, sensis: undefined }));
        const sensis = state.answers.map(a => a.sensis);
        const convertVal = (v: boolean | number) => (typeof v === 'boolean' ? (v ? 1 : 0) : v);
        const merge = (items: any[]) =>
            Object.entries(
                items.reduce(
                    (a, c) =>
                        Object.entries(c)
                            .filter(([_, v]) => v !== undefined)
                            .map(([k, v]) => ({
                                [k]: convertVal((a as any)[k] || 0) + convertVal(v as boolean)
                            }))
                            .reduce((a, c) => ({ ...a, ...c })),
                    {} as any
                )
            );
        const res1 = merge(values)
            .map(([k, v]) => ({ [k]: (v as number) / state.answers.length }))
            .reduce((a, c) => ({ ...a, ...c }));
        const res2 = merge(sensis)
            .map(([k, v]) => ({ [k]: (v as number) / state.answers.length }))
            .reduce((a, c) => ({ ...a, ...c }));

        return this.gameRepository
            .completeStateSeed(
                state,
                {
                    ...(res1 as any),
                    ...(res2 as any)
                } as SeedSensisResult,
                this.getRegionIndexes(),
                MathJS.std([values.map(v => v.age)], 'unbiased')
            )
            .then(state =>
                Promise.all([
                    this.generate(state, 1),
                    this.gameRepository.createState({
                        step: GameStateStep.Group,
                        game_id: state.game_id,
                        user_id: state.user_id,
                        applied: 0,
                        total: game.nb_teams,
                        completed: false
                    })
                ])
            )
            .then(() => undefined);
    }

    getRegionIndexes(): number[] {
        return new Array(7)
            .fill(null)
            .map(() => MathJS.random(0, 1))
            .map((val, _, arr) => val / arr.reduce((a, c) => a + c, 0))
            .map(
                (
                    sum => (value: number) =>
                        (sum += value)
                )(0)
            )
            .map(val => Math.round(val * 10000) / 10000);
    }

    async generate(state: SeedState, round: number): Promise<any[]> {
        const arr = new Array(10000)
            .fill(null)
            .map(() => this.computeAge(state.sensis?.age || 0, state.age_std))
            .map(age => this.computeAmount(age))
            .map(item => [...item, 0.01])
            .map(item => [...item, MathJS.random(0, 1)])
            .map(([age, amount, out, r]) => [
                age,
                amount,
                out,
                this.computeRegion(state.region_indexes, r)
            ]);
        return this.gameRepository.createSeed(state, round, arr);
    }

    private computeAge(age: number, std: number): number {
        const val = Vega.randomNormal(age, std).sample();
        return val < 18 ? 18 : val > 90 ? 90 : Math.round(val);
    }

    private computeAmount(age: number): [number, number] {
        const categories = [25, 30, 35, 40, 120];
        const rate = [0, 0.1, 0.15, 0.2, 0.3];
        const value =
            categories.find((c, i) => {
                return age < c && (categories[i - 1] === undefined || age >= categories[i - 1]);
            }) || 0;
        return [
            age,
            Math.round(
                Vega.randomNormal(
                    (1 + rate[categories.indexOf(value)]) * this.baseAmount,
                    500
                ).sample()
            )
        ];
    }

    private computeRegion(indexes: number[], value: number): number {
        const index =
            indexes.find((c, i) => {
                return value < c && (indexes[i - 1] === undefined || value >= indexes[i - 1]);
            }) || 0;
        return indexes.indexOf(index) + 1;
    }
}
