import { Service } from '@ekonoo/lambdi';
import * as MathJS from 'mathjs';

interface Company {
    management_fee: number;
    entry_fee: number;
    commission: number;
    tg: number;
    tg_rate?: number;
    garantee: number;
    garantee_fee?: number;
    backoffice: number;
    marketing: number;
}

@Service()
export class TestService {
    formula1(sensi: number, invests: number[], customers: number): number[] {
        return invests.map((invest, i) => {
            const p = invest / invests.reduce((a, c) => a + c, 0);
            const x = p * (customers * sensi);
            const r = ((1 - sensi) * customers) / invests.length;

            return x + r;
            // console.log(`${p} => ${x + r}`);
        });
    }

    formula2(sensi: number, fees: number[], customers: number): number[] {
        const res = fees
            .map(fee => ({ f: fee, t: fee / fees.reduce((a, c) => a + c, 0) }))
            .map(item => ({
                ...item,
                tb: 1 / item.f
            }))
            .map((item, i, arr) => {
                const _t = arr.map(x => x.tb).reduce((a, c) => a + c, 0);
                const tbt = item.tb / _t;
                return { ...item, tbt };
            })
            .map(item => ({ ...item, e: fees.map(ff => Math.abs(item.f - ff)).reduce((a, c) => a + c, 0) }))
            .map((item, i, arr) => ({ ...item, eb: 1 - item.e / arr.map(x => x.e).reduce((a, c) => a + c, 0) }))
            .map((item, i, arr) => ({
                ...item,
                ebe: (item.eb / arr.map(x => x.eb).reduce((a, c) => a + c, 0)) * item.tbt
            }))

            .map((item, i, arr) => ({ ...item, final: item.ebe / arr.map(x => x.ebe).reduce((a, c) => a + c, 0) }))
            .map(item => ({ ...item, sensi: item.final * customers * sensi }))
            .map(item => ({ ...item, nsensi: ((1 - sensi) * customers) / fees.length }));

        // res.forEach(r => console.log(`${r.f} => ${r.sensi + r.nsensi}`));
        return res.map(r => r.sensi + r.nsensi);
    }

    formula3(sensi: number, fees: number[], customers: number): number[] {
        const res = fees
            .map(fee => ({ f: fee, t: fee / fees.reduce((a, c) => a + c, 0) }))
            .map(item => ({ ...item, e: fees.map(ff => Math.abs(item.f - ff)).reduce((a, c) => a + c, 0) }))
            .map((item, i, arr) => ({ ...item, eb: 1 - item.e / arr.map(x => x.e).reduce((a, c) => a + c, 0) }))
            .map((item, i, arr) => ({
                ...item,
                ebe: (item.eb / arr.map(x => x.eb).reduce((a, c) => a + c, 0)) * item.t
            }))

            .map((item, i, arr) => ({ ...item, final: item.ebe / arr.map(x => x.ebe).reduce((a, c) => a + c, 0) }))
            .map(item => ({ ...item, sensi: item.final * customers * sensi }))
            .map(item => ({ ...item, nsensi: ((1 - sensi) * customers) / fees.length }));

        return res.map(r => r.sensi + r.nsensi);
    }

    formula4(sensi: number, fees: number[], customers: number): number[] {
        const _sensi = fees.map(f => (f ? (sensi * customers) / fees.filter(f => f === 1).length : 0));
        const _nsensi = fees.map(f => ((1 - sensi) * customers) / fees.length);
        // fees.forEach((f, i) => console.log(`${f} => ${_sensi[i] + _nsensi[i]}`));
        return fees.map((f, i) => _sensi[i] + _nsensi[i]);
    }
}

const svc = new TestService();

const companies: Company[] = [
    {
        backoffice: 5,
        marketing: 2,
        tg: 0,
        commission: 0.005,
        entry_fee: 0.02,
        management_fee: 0.01,
        garantee: 1,
        garantee_fee: 0.01
    },
    {
        backoffice: 2,
        marketing: 6,
        tg: 1,
        tg_rate: 0.01,
        commission: 0.003,
        entry_fee: 0.05,
        management_fee: 0.03,
        garantee: 1,
        garantee_fee: 0.015
    },
    {
        backoffice: 1,
        marketing: 9,
        tg: 0,
        commission: 0.01,
        entry_fee: 0.01,
        management_fee: 0.03,
        garantee: 1,
        garantee_fee: 0.02
    },
    {
        backoffice: 2,
        marketing: 6,
        tg: 0,
        commission: 0.02,
        entry_fee: 0.03,
        management_fee: 0.05,
        garantee: 0
    }
];

const people = 20000;

const sensis = [0.3, 0.1, 0.9, 0.7, 1, 0.2, 0.2, 0.1, 0.2];

const a = [
    svc.formula1(
        sensis[0],
        companies.map(c => c.backoffice),
        people
    ),
    svc.formula1(
        sensis[1],
        companies.map(c => c.marketing),
        people
    ),
    svc.formula4(
        sensis[2],
        companies.map(c => c.tg),
        people
    ),
    // svc.formula3(
    //     sensis[3],
    //     companies.filter(c => c.tg_rate).map(c => c.tg_rate as number),
    //     people
    // ),
    svc.formula3(
        sensis[4],
        companies.map(c => c.commission),
        people
    ),
    svc.formula2(
        sensis[5],
        companies.map(c => c.entry_fee),
        people
    ),
    svc.formula2(
        sensis[6],
        companies.map(c => c.management_fee),
        people
    ),
    svc.formula4(
        sensis[7],
        companies.map(c => c.garantee),
        people
    ),
    svc.formula2(
        sensis[8],
        companies.filter(c => c.garantee_fee).map(c => c.garantee_fee as number),
        people
    )
];

console.log(a);

console.log(companies.map((c, i) => MathJS.mean(a.map(r => r[i]).filter(Boolean))));

// svc.formula1(1, [4, 9, 3], 10000);
// console.log('-----------');
// svc.formula2(0.6, [0.025, 0.018, 0.0165, 0.017], 10000);
// console.log('-----------');
// svc.formula3(1, [0.02, 0.008, 0.0085, 0.01], 10000);
// console.log('-----------');
// svc.formula4(0.2, [0, 0, 0, 1], 10000);
