import { Module } from "@nestjs/common";
import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";
import { InvitesService } from "./invites.service";

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, InvitesService],
})
export class ClassesModule {}