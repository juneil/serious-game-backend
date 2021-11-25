import { Required } from '@ekonoo/models';

export class AuthHeader {
    @Required Authorization: string;
}
