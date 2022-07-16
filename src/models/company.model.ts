import { Enum, ExtendRules, Item, Required } from '@ekonoo/models';
import { PersistentEntity } from './common.model';

export enum TransactionDirection {
    Credit = 'CREDIT',
    Debit = 'DEBIT'
}

export enum TransactionCode {
    EntryFees = 'ENTRY_FEES'
}

export class Transaction {
    @Required amount: number;
    @Required @Enum(...Object.values(TransactionDirection)) direction: TransactionDirection;
    @Required @Enum(...Object.values(TransactionCode)) code: TransactionCode;
}

export class RoundDetail {
    @Required start_amount: number;
    @Required end_amount: number;
    @Required @Item(Transaction) transactions: Transaction[];
}

@ExtendRules(PersistentEntity)
export class Company extends PersistentEntity {
    @Required user_id: string;
    @Required game_id: string;
    @Required name: string;
    @Required @Item(RoundDetail) round_details: RoundDetail[];
    @Required score: number;
}
