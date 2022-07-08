import { Enum, Required, Simple } from '@ekonoo/models';

export class PersistentEntity {
    @Simple id?: string;
    @Simple created_date?: number;
    @Simple updated_date?: number;
}

export class AuthHeader {
    @Simple Authorization: string;
}

export class GetPathParam {
    @Required id: string;
}

export class GetPathWithRoundParam {
    @Required id: string;
    @Required @Enum('1', '2', '3', '4', '5') round: string;
}
