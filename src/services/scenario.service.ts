import { Service } from '@ekonoo/lambdi';
import { ScenarioRepository } from '../repositories/scenario.repository';
import { ScenarioFunds, ScenarioLight } from '../models/scenario.model';

@Service({ providers: [ScenarioRepository] })
export class ScenarioService {
    constructor(private scenarioRepository: ScenarioRepository) {}

    async getAllNames(): Promise<ScenarioLight[]> {
        return this.scenarioRepository.getAll();
    }

    async getFundsByIdAndRound(id: string, round: number): Promise<ScenarioFunds[]> {
        return this.scenarioRepository.getFundsByIdAndRound(id, round);
    }
}
