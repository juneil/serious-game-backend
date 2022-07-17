/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from '@ekonoo/lambdi';
import { User } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import JWT from 'jsonwebtoken';
import { LoginResponse } from '../models/user.model';
import { BusinessError, ErrorCode } from '../utils/error';
import Crypto from 'crypto';

@Service({ providers: [UserRepository] })
export class UserService {
    private SECRET = process.env.SECRET || '0lbPLntl621sadbw54';

    constructor(private userRepository: UserRepository) {}

    async create(user: User): Promise<User> {
        return this.userRepository.create({ ...user, password: this.hashPassword(user.password) });
    }

    async getByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.getByEmail(email);
    }

    async login(email: string, password: string, companyId?: string): Promise<LoginResponse> {
        return this.getByEmail(email)
            .then(user =>
                user
                    ? user
                    : Promise.reject(new BusinessError(ErrorCode.E001, `User not found [${email}]`))
            )
            .then(user =>
                user.password === this.hashPassword(password)
                    ? user
                    : Promise.reject(new BusinessError(ErrorCode.E001, `Wrong password [${email}]`))
            )
            .then(user => ({ user, token: this.generateToken(user, companyId) }));
    }

    async verify(token: string): Promise<User> {
        return Promise.resolve(token)
            .then(t => JWT.verify(t, this.SECRET))
            .catch(err =>
                Promise.reject(new BusinessError(ErrorCode.E003, 'Invalid JWT ' + err.message))
            )
            .then(decoded =>
                this.userRepository
                    .getByEmail((decoded as any).email)
                    .then(user =>
                        user
                            ? user
                            : Promise.reject(
                                  new BusinessError(
                                      ErrorCode.E003,
                                      `User not found [${(decoded as any).email}]`
                                  )
                              )
                    )
            );
    }

    private generateToken(user: User, companyId?: string): string {
        return JWT.sign({ email: user.email, company_id: companyId }, this.SECRET, {
            expiresIn: '30d',
            issuer: 'skillins',
            audience: 'skillins'
        });
    }

    private hashPassword(password: string): string {
        return Crypto.createHash('md5').update(password).digest('hex');
    }
}
