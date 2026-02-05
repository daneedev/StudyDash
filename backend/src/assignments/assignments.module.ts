import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { Assignments } from './assignments.service';

@Module({
  controllers: [AssignmentsController],
  providers: [Assignments]
})
export class AssignmentsModule {}
