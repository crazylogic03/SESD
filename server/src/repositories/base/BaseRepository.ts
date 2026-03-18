

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = prisma;
  }

  
  protected get model(): any {
    return (this.prisma as any)[this.modelName];
  }

  
  public async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  
  public async findAll(filter?: Record<string, any>): Promise<T[]> {
    return this.model.findMany({ where: filter });
  }

  
  public async create(data: any): Promise<T> {
    return this.model.create({ data });
  }

  
  public async update(id: string, data: any): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  
  public async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } });
  }

  
  public async count(filter?: Record<string, any>): Promise<number> {
    return this.model.count({ where: filter });
  }
}
