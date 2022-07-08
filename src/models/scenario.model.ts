import { Enum, ExtendRules, Item, Min, Required, Simple } from '@ekonoo/models';
import { PersistentEntity } from './common.model';
import { GameInvestmentType } from './game.model';

export class Fund {
    @Required code: string;
    @Required @Item(String) type: string[];
    @Required @Item(Number) nav: number[];
    @Required srri: number;
    @Required currency: string;
    @Simple @Item(Number) conversion_rates?: number[];
}

export class FundLight {
    @Required code: string;
    @Required @Item(String) type: string[];
    @Required @Item(Number) nav: number;
    @Required srri: number;
    @Required currency: string;
}

export class TG {
    @Required rate: number;
    @Required rate_penalty: number;
    @Required performance: number;
    @Required performance_penalty: number;
}

export class Garantee {
    @Required forced: boolean;
    @Required forced_penalty: number;
}

export class ProfileUniverse {
    @Required type: string;
    @Required value: number;
    @Required value_penalty: number;
}

export class Profile {
    @Required forced: boolean;
    @Required forced_penalty: number;
    @Required srri_mean: number;
    @Required @Item(ProfileUniverse) profiles: ProfileUniverse[];
}

export class Offer {
    @Required only_tg_garantee_penalty: number;
    @Simple garantee?: Garantee;
    @Simple low?: Profile;
    @Simple moderate?: Profile;
    @Simple high?: Profile;
}

export class MandatoryInvestment {
    @Required @Enum(...Object.values(GameInvestmentType)) type: GameInvestmentType;
    @Required @Min(0) min_investment: number;
    @Required penalty_thresold: number;
    @Required penalty_step: number;
}

export class Rules {
    @Required death_modifier: number;
    @Required @Min(0) max_entry_fees: number;
    @Required @Min(0) max_entry_fees_penalty: number;
    @Required @Min(0) max_management_fees: number;
    @Required @Min(0) max_management_fees_penalty: number;
    @Required tg: TG;
    @Required offer: Offer;
    @Required @Item(MandatoryInvestment) mandatory_investments: MandatoryInvestment[];
}

@ExtendRules(PersistentEntity)
export class Scenario extends PersistentEntity {
    @Required name: string;
    @Required @Item(Fund) funds: Fund[];
    @Required @Item(Rules) rules: Rules[];
}

@ExtendRules(PersistentEntity)
export class ScenarioLight extends PersistentEntity {
    @Required name: string;
}

@ExtendRules(PersistentEntity)
export class ScenarioFunds extends PersistentEntity {
    @Required name: string;
    @Required @Item(FundLight) funds: FundLight[];
}

export class ListScenarioResponse {
    @Required @Item(ScenarioLight) list: ScenarioLight[]
}

export class ListScenarioFundsResponse {
    @Required @Item(ScenarioFunds) list: ScenarioFunds[]
}

/**
 * ####################################
 * ########  SCENARIO EXAMPLE  ########
 * ####################################
 */

// {
//     "name": "Crash",
//     "funds": [
//         {
//             "code": "FRXXXXXX01",
//             "types": ["GAZ"],
//             "srri": 1
//              "currency": "EUR"
//             "nav": [110, 100, 98, 73]
//         },
//         {
//             "code": "FRXXXXXX02",
//             "types": ["GAZ"],
//             "srri": 1
//              "currency": "EUR"
//             "nav": [4400, 4399, 4300, 4240]
//         },
//         {
//             "code": "USXXXXXX02",
//             "types": ["GAZ"],
//             "srri": 1
//              "currency": "USD",
//              "conversion": [1.2, 1.3, 1.4, 1.5],
//             "nav": [4400, 4399, 4300, 4240]
//         }
//     ],
//     "rules": [
//         // round 1
//         {
//             "max_entry_fees": 0.05,
//             "max_entry_fees_penalty": 100000,
//             "max_management_fees": 0.03,
//             "max_management_fees_penalty": 250000,
// tg: `{
//     rate: {
// "value": 0.25,
//       penalty: 0.05
//}
// perf: 0.85
// penalty: 0.05
// }`
//             "offer": {
// "only_tg_garantee_penalty": 0.05
// "garantee": {
//     "value": 1,
//     "penalty": 0.05
// }
//    "low": {
//        "mean": 3
//    }
//                     "moderate": {
//    "mean": 5
//                         "ISR": {
//                             "value": 0.3,
//                             "penalty": 0.05
//                         }
//                     },
//    "high": {
//        "mean": 7
//    }
//              }
//         },
//         // round 2
//         {
//             "max_entry_fees": 0.05,
//             "max_entry_fees_penalty": 100000,
//             "max_management_fees": 0.03,
//             "max_management_fees_penalty": 250000,

//             "death_modifier": 1,

//             "mandatory_investment": {
//    "legal": {
//        "value": 3,
//        "penalty_thresold": 0.05,
//        "penalty_step": 0.01
//    }
//         },
//         // round 3
//         {
//             "max_entry_fees": 0.05,
//             "max_entry_fees_penalty": 1000000,
//             "max_management_fees": 0.03,
//             "max_management_fees_penalty": 2500000
//         }
//     ]
// }
