import { Simple } from '@ekonoo/models';

export class PersistentEntity {
    @Simple id?: string;
    @Simple created_date?: number;
    @Simple updated_date?: number;
}
