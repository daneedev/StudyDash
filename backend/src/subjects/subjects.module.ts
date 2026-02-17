import { Module } from '@nestjs/common';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService, PrismaService],
})
export class SubjectsModule {}
