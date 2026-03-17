

import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../enums/UserRole';

export class User {
  private _id: string;
  private _username: string;
  private _email: string;
  private _passwordHash: string;
  private _role: UserRole;
  private _createdAt: Date;

  constructor(
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.TRADER,
    id?: string,
    createdAt?: Date
  ) {
    this._id = id || uuidv4();
    this._username = username;
    this._email = email;
    this._passwordHash = passwordHash;
    this._role = role;
    this._createdAt = createdAt || new Date();
  }

  get id(): string {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get role(): UserRole {
    return this._role;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  get isTrader(): boolean {
    return this._role === UserRole.TRADER;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this._id,
      username: this._username,
      email: this._email,
      role: this._role,
      createdAt: this._createdAt,
    };
  }
}
