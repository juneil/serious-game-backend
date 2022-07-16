import { Service } from '@ekonoo/lambdi';
import { Company } from '../models/company.model';
import { Game } from '../models/game.model';
import { CompanyRepository } from '../repositories/company.repository';

@Service({ providers: [CompanyRepository] })
export class CompanyService {
    constructor(private companyRepository: CompanyRepository) {}

    async create(company: Company): Promise<Company> {
        return this.companyRepository.create(company);
    }

    async getByGameAndId(game: Game, id: string): Promise<Company | undefined> {
        return this.companyRepository.getByGameAndId(game, id);
    }

    async getByGame(game: Game): Promise<Company[]> {
        return this.companyRepository.getByGame(game);
    }
}
