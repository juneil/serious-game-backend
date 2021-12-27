import { Service } from '@ekonoo/lambdi';
import { Game } from '../models/game.model';
import { GameRepository } from '../repositories/game.repository';

@Service({ providers: [GameRepository] })
export class GameService {
    constructor(private gameRepository: GameRepository) {}

    async create(game: Game): Promise<Game> {
        return this.gameRepository.create(game);
    }

    async getByUserId(userId: string): Promise<Game[]> {
        return this.gameRepository.getByUserId(userId);
    }

    async getByUserIdAndId(userId: string, id: string): Promise<Game | undefined> {
        return this.gameRepository.getByUserId(userId).then(games => games.find(game => game.id === id));
    }
}
