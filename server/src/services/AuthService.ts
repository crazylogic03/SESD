

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { config } from '../config';
import { Logger } from '../utils/logger';

interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export class AuthService {
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;
  private logger: Logger;

  constructor() {
    this.userRepository = new UserRepository();
    this.walletRepository = new WalletRepository();
    this.logger = new Logger('AuthService');
  }

  
  public async register(
    username: string,
    email: string,
    password: string,
    role: string = 'TRADER'
  ): Promise<AuthResponse> {

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('Username already taken');
    }

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await this.userRepository.create({
      username,
      email,
      passwordHash,
      role: role as any,
    });

    await this.walletRepository.createForUser(user.id, 100000);

    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    this.logger.info(`User registered: ${username} (${role})`);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  
  public async login(
    username: string,
    password: string
  ): Promise<AuthResponse> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    this.logger.info(`User logged in: ${username}`);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  
  public verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  
  private generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }
}
