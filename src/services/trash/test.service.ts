// import { Service } from '@ekonoo/lambdi';
// import * as MathJS from 'mathjs';

import { Service } from "lambdi";
import { map } from "mathjs";

interface Company {
    management_fee_uc: number;
    management_fee_tg: number;
    entry_fee: number;
    commission: number;
    uc: number;
    tg: number;
    tg_rate?: number;
    tg_profit_sharing: number;
    performance: number;
    garantee: number;
    garantee_fee?: number;
    legal: number;
    backoffice: number;
    marketing: number;
    digital: number;
    sales: number[];
}

@Service()
export class TestService {
    formula1(sensi: number, invests: number[], customers: number): number[] {
        if (invests.reduce((a, c) => a + c) === 0) {
            return invests.map(() => customers / invests.length);
        }
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
                tb: item.f === 0 ? 0 : 1 / item.f
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

const regions = [1000, 2000, 500, 500, 1000, 1000, 4000];

const svc = new TestService();

const companies: Company[] = [
    {
        backoffice: 1,
        marketing: 3,
        digital: 5,
        performance: 0.1,
        legal: 4,
        sales: [0,1,2,4,6,8,10],
        tg: 1,
        tg_rate: 0.01,
        tg_profit_sharing: 0.015,
        uc: 1,
        commission: 0.03,
        entry_fee: 0.05,
        management_fee_uc: 0.02,
        management_fee_tg: 0.01,
        garantee: 1,
        garantee_fee: 0.01
    },
    {
        backoffice: 2,
        marketing: 4,
        digital: 2,
        performance: 0.08,
        legal: 5,
        sales: [4,3,2,5,8,3,2],
        tg: 1,
        tg_rate: 0.015,
        tg_profit_sharing: 0.01,
        uc: 0,
        commission: 0.02,
        entry_fee: 0.04,
        management_fee_uc: 0,
        management_fee_tg: 0.02,
        garantee: 0,
        garantee_fee: 0
    },
    {
        backoffice: 3,
        marketing: 2,
        digital: 3,
        performance: 0.05,
        legal: 2,
        sales: [0,0,0,1,1,1,10],
        tg: 1,
        tg_rate: 0.02,
        tg_profit_sharing: 0.02,
        uc: 1,
        commission: 0.02,
        entry_fee: 0.03,
        management_fee_uc: 0.01,
        management_fee_tg: 0.03,
        garantee: 1,
        garantee_fee: 0.02
    },
    {
        backoffice: 4,
        marketing: 8,
        digital: 4,
        performance: 0.11,
        legal: 9,
        sales: [3,2,7,2,8,7,9],
        tg: 0,
        tg_rate: 0,
        tg_profit_sharing: 0,
        uc: 1,
        commission: 0.01,
        entry_fee: 0.02,
        management_fee_uc: 0.04,
        management_fee_tg: 0,
        garantee: 0,
        garantee_fee: 0
    }
];

const people = 10000;

const sensis = [0.3, 0.1, 1, 0.8, 0.2, 1, 0.2, 0.2, 0.2, 1, 1, 0.9, 0.8, 1, 0.8, 1];

const matrix = {
    cost: 30,
    service: 20,
    protection: 40,
    performance: 50
}

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
    svc.formula1(
        sensis[2],
        companies.map(c => c.legal),
        people
    ),
    svc.formula4(
        sensis[3],
        companies.map(c => c.tg),
        people
    ),
    svc.formula4(
        sensis[4],
        companies.map(c => c.uc),
        people
    ),
    svc.formula3(
        sensis[5],
        companies.map(c => c.tg_rate as number),
        people
    ),
    svc.formula2(
        sensis[6],
        companies.map(c => c.entry_fee),
        people
    ),
    svc.formula2(
        sensis[7],
        companies.map(c => c.management_fee_uc),
        people
    ),
    svc.formula2(
        sensis[8],
        companies.map(c => c.management_fee_tg),
        people
    ),
    svc.formula4(
        sensis[9],
        companies.map(c => c.garantee),
        people
    ),
    svc.formula2(
        sensis[10],
        companies.map(c => c.garantee_fee as number),
        people
    ),
    svc.formula3(
        sensis[11],
        companies.map(c => c.performance),
        people
    ),
    svc.formula3(
        sensis[12],
        companies.map(c => c.tg_profit_sharing),
        people
    ),

    regions.map(r => svc.formula1(1, companies.map(c => c.commission), r)),
    regions.map(r => svc.formula1(1, companies.map(c => c.digital), r)),
    regions.map((r, i) => svc.formula1(1, companies.map(c => c.sales[i]), r))

    // svc.formula1(
    //     sensis[13],
    //     companies.map(c => c.commission),
    //     people
    // ),
    // svc.formula1(
    //     sensis[14],
    //     companies.map(c => c.digital),
    //     people
    // ),
    // svc.formula1(
    //     sensis[15],
    //     companies.map(c => c.sales),
    //     people
    // )
];

function round(values: number[]): number[] {
    if (Array.isArray(values[0])) {
        return values.map(v => round(v as any)) as any;
    }
    const total = values.reduce((a, c) => a + c, 0);
    const res = values.map(val => Math.round(val));
    const delta = total - res.reduce((a, c) => a + c, 0);
    res[res.indexOf(Math.max(...res))] = Math.round(Math.max(...res) + delta);
    return res;
}

const values = a.map(s => round(s as any));

console.log(values);


const buckets = companies.map((c, i) => ({
    cost: ((values[7][i] as number) + (values[8][i] as number) + (values[6][i] as number) + (values[10][i] as number)) / 4,
    service: ((values[0][i] as number) + (values[1][i] as number)) / 2,
    performance: ((values[4][i] as number) + (values[11][i] as number) + (values[12][i] as number)) / 3,
    protection: ((values[2][i] as number) + (values[3][i] as number) + (values[9][i] as number)) / 3
}))

console.log(buckets);

const part = round(buckets.map(bucket =>
    (matrix.cost * bucket.cost +
    matrix.performance * bucket.performance +
    matrix.protection * bucket.protection +
    matrix.service * bucket.service) / Object.values(matrix).reduce((a, c) => a + c, 0)
))

console.log(part);

const scores = part.map(p => p / people);

console.log(scores);

const tmds = round(regions.map((r, i) => {
    return companies.map((c, j) => (values as any)[14][i][j] * sensis[14] +
    (values as any)[15][i][j] * (1 - sensis[14]))
}) as any)


const tmdc = round(regions.map((r, i) => {
    return companies.map((c, j) => ((tmds as any)[i][j] + (values as any)[13][i][j]) / 2)
}) as any)

console.log(round(tmdc as any))

const wscore = regions.map((_, i) => scores.map((score, j) => score * (tmdc as any)[i][j]))

console.log(wscore)

const final = round(regions.map((r, i) => companies.map(
    (c, j) =>
        (r * (wscore as any)[i][j] as number) /
        ((wscore as any)[i]).reduce((a : any, c : any) => a + c, 0) as number)) as any)

console.log(final)

console.log(companies.map((_, i) => regions.map((_, j) => (final as any)[j][i])).map(vv => vv.reduce((aa, cc) => aa + cc, 0)))

// console.log(companies.map((c, i) => MathJS.mean(a.map(r => r[i]).filter(Boolean))));

// // svc.formula1(1, [4, 9, 3], 10000);
// // console.log('-----------');
// // svc.formula2(0.6, [0.025, 0.018, 0.0165, 0.017], 10000);
// // console.log('-----------');
// // svc.formula3(1, [0.02, 0.008, 0.0085, 0.01], 10000);
// // console.log('-----------');
// // svc.formula4(0.2, [0, 0, 0, 1], 10000);
