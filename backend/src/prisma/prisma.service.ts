import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter: pool });
  }
  async onModuleInit() {
    await this.$connect();
    console.log('Connected to PostgreSQL database');
  }
}
