import { Service } from '@ekonoo/lambdi';
import {
    Game,
    GameState,
    GameStateStep,
    RoundP1Answer,
    RoundP1State
} from '../../models/game.model';
import { GameRepository } from '../../repositories/game.repository';
import { CompanyService } from '../company.service';
import { BaseStateService } from './base-state.service';

@Service({ providers: [GameRepository, CompanyService] })
export class RoundPart1StateService extends BaseStateService<RoundP1State, RoundP1Answer> {
    public type = GameStateStep.RoundP1;

    constructor(protected gameRepository: GameRepository, private company: CompanyService) {
        super();
    }

    async update(_: Game, state: RoundP1State, data: RoundP1Answer): Promise<GameState> {
        return Promise.resolve(state)
            .then(state => super.checkState(state))
            .then(() =>
                this.gameRepository.updateState(
                    state.user_id,
                    state.game_id as string,
                    this.type,
                    data,
                    RoundP1State
                )
            )
            .then(state => this.complete(state).then(() => state));
    }

    private async completeCompute(game: Game, state: RoundP1State) {
        return Promise.all([
            this.gameRepository.getSeed(state, state.round || 1),
            this.gameRepository
                .getStatesByGame(game)
                .then(states => states.filter(state => state.step === GameStateStep.Seed).pop())
        ]).then(([seed, seedState]) => {
            const regions = new Array(7)
                .fill(null)
                .map((_, i) => seed.filter((s: any) => s[3] === i + 1).length);
        });
    }

    private formula1(sensi: number, invests: number[], customers: number): number[] {
        if (invests.reduce((a, c) => a + c) === 0) {
            return invests.map(() => customers / invests.length);
        }
        return invests.map((invest, i) => {
            const p = invest / invests.reduce((a, c) => a + c, 0);
            const x = p * (customers * sensi);
            const r = ((1 - sensi) * customers) / invests.length;
            return x + r;
        });
    }

    private formula2(sensi: number, fees: number[], customers: number): number[] {
        const res = fees
            .map(fee => ({ f: fee, t: fee / fees.reduce((a, c) => a + c, 0) }))
            .map(item => ({
                ...item,
                tb: item.f === 0 ? 0 : 1 / item.f
            }))
            .map((item, i, arr) => {
                const _t = arr.map(x => x.tb).reduce((a, c) => a + c, 0);
                const tbt = item.tb / _t;
                return { ...item, tbt };
            })
            .map(item => ({
                ...item,
                e: fees.map(ff => Math.abs(item.f - ff)).reduce((a, c) => a + c, 0)
            }))
            .map((item, i, arr) => ({
                ...item,
                eb: 1 - item.e / arr.map(x => x.e).reduce((a, c) => a + c, 0)
            }))
            .map((item, i, arr) => ({
                ...item,
                ebe: (item.eb / arr.map(x => x.eb).reduce((a, c) => a + c, 0)) * item.tbt
            }))

            .map((item, i, arr) => ({
                ...item,
                final: item.ebe / arr.map(x => x.ebe).reduce((a, c) => a + c, 0)
            }))
            .map(item => ({ ...item, sensi: item.final * customers * sensi }))
            .map(item => ({ ...item, nsensi: ((1 - sensi) * customers) / fees.length }));
        return res.map(r => r.sensi + r.nsensi);
    }

    private formula3(sensi: number, fees: number[], customers: number): number[] {
        const res = fees
            .map(fee => ({ f: fee, t: fee / fees.reduce((a, c) => a + c, 0) }))
            .map(item => ({
                ...item,
                e: fees.map(ff => Math.abs(item.f - ff)).reduce((a, c) => a + c, 0)
            }))
            .map((item, i, arr) => ({
                ...item,
                eb: 1 - item.e / arr.map(x => x.e).reduce((a, c) => a + c, 0)
            }))
            .map((item, i, arr) => ({
                ...item,
                ebe: (item.eb / arr.map(x => x.eb).reduce((a, c) => a + c, 0)) * item.t
            }))

            .map((item, i, arr) => ({
                ...item,
                final: item.ebe / arr.map(x => x.ebe).reduce((a, c) => a + c, 0)
            }))
            .map(item => ({ ...item, sensi: item.final * customers * sensi }))
            .map(item => ({ ...item, nsensi: ((1 - sensi) * customers) / fees.length }));

        return res.map(r => r.sensi + r.nsensi);
    }

    private formula4(sensi: number, fees: number[], customers: number): number[] {
        const _sensi = fees.map(f =>
            f ? (sensi * customers) / fees.filter(f => f === 1).length : 0
        );
        const _nsensi = fees.map(f => ((1 - sensi) * customers) / fees.length);
        return fees.map((f, i) => _sensi[i] + _nsensi[i]);
    }
}
