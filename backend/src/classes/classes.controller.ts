import { Controller, Delete, Get, Patch, Post } from "@nestjs/common";

@Controller('classes')
export class ClassesController {
  // Controller methods will go here
  @Get() getClasses() {
    return { message: "List of classes" };
  }
  @Get(':id') getClassById() {
    return { message: "Class details by ID" };
  }
  @Post() createClass() {
    return { message: "Create a new class" };
  }
  @Patch(':id') updateClass() {
    return { message: "Update class by ID" };
  }
  @Delete(':id') deleteClass() {
    return { message: "Delete class by ID" };
  }
}