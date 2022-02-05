import { Service } from '@ekonoo/lambdi';
import { GameStateSeed } from '../models/game.model';

@Service()
export class SeedService {
    async generate(gameState: GameStateSeed): Promise<void> {}
}
