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
    @Required technical_rate: number;
    @Required technical_rate_penalty: number;
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
    @Required @Item(Number) risk_repartition: number[];
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
    @Required @Item(ScenarioLight) list: ScenarioLight[];
}

export class ListScenarioFundsResponse {
    @Required @Item(ScenarioFunds) list: ScenarioFunds[];
}
