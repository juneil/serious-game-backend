import { ExtendRules, Required } from "@ekonoo/models";
import { PersistentEntity } from "./common.model";

@ExtendRules(PersistentEntity)
export class Company extends PersistentEntity {
    @Required user_id: string;
    @Required game_id: string;
    @Required name: string;
    @Required score: number;
}
