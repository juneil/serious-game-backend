import { Service } from '@ekonoo/lambdi';
import { GameStateSeed } from '../models/game.model';
import * as MathJS from 'mathjs';
const Vega = require('vega-statistics');

@Service()
export class SeedService {
    private size = 20000;
    private baseAmmount = 5000;
    private age?: number = undefined;
    private std?: number = undefined;

    async generate(gameState: GameStateSeed): Promise<void> {
        const regionIndexes = new Array(7)
            .fill(null)
            .map(() => MathJS.random(0, 1))
            .map((val, _, arr) => val / arr.reduce((a, c) => a + c, 0))
            .map(
                (
                    sum => (value: number) =>
                        (sum += value)
                )(0)
            );
        const arr = new Array(this.size)
            .fill(null)
            .map(() => this.computeAge(gameState.answers.map(a => a[0])))
            .map(age => this.computeAmount(age))
            .map(item => [...item, 0.01])
            .map(item => [...item, MathJS.random(0, 1)])
            .map(([age, amount, out, r]) => [age, amount, out, this.computeRegion(regionIndexes, r)]);

        new Array(7)
            .fill(null)
            .map((_, i) => i + 1)
            .forEach(i => {
                const a = arr.filter(x => x[3] === i);
                const age = a.length ? MathJS.mean(a.map(item => item[0])) : 0;
                const amount = a.length ? MathJS.mean(a.map(item => item[1])) : 0;
                const count = a.length;
                console.log(`${i} => ${Math.round(age)} => ${Math.round(amount)} => ${count}`);
            });

        console.log(JSON.stringify(arr).length, JSON.stringify(arr));
    }

    private computeAge(ages: number[]): number {
        if (!this.age) {
            this.age = MathJS.mean(...ages);
        }
        if (!this.std) {
            this.std = MathJS.std(ages, 'unbiased');
        }
        const age = Vega.randomNormal(this.age, this.std).sample();
        return age < 18 ? 18 : age > 90 ? 90 : Math.round(age);
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
            Math.round(Vega.randomNormal((1 + rate[categories.indexOf(value)]) * this.baseAmmount, 500).sample())
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

const svc = new SeedService();

svc.generate({ answers: [[20], [40]] } as any);
