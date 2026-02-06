import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ClassesService } from "./classes.service";
import { ClassDto } from "src/dto/";
import { AuthGuard } from "src/auth/auth.guard";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { ClassesAdminGuard, ClassesGuard } from "./classes.guard";
import { InvitesService } from "./invites.service";

@Controller('classes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ClassesController {
  constructor(private classesService: ClassesService, private invitesService: InvitesService) {}
  // Controller methods will go here
  @ApiOperation({ summary: 'Get list of all users classes' })
  @ApiResponse({
    status: 200,
    description: 'List of classes retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      data: [
        {
          id: 1,
          name: 'Math 101',
          inviteCode: 'ABCD1234',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @Get() getClasses(@Req() req) {
    return this.classesService.getAllUserClasses(req.user);
  }

  @UseGuards(ClassesGuard)
  @ApiOperation({ summary: 'Get class details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class details retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        id: 1,
        name: 'Math 101',
        inviteCode: 'ABCD1234',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    example: {
      success: false,
      statusCode: 403,
      message: 'Access to class denied',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Class not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Class not found',
    },
  })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @Get(':id') getClassById(@Param('id') id: number) {
    return this.classesService.getClassById(id);
  }

  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({
    status: 201,
    description: 'Class created successfully',
    example: {
      success: true,
      statusCode: 201,
      data: {
        id: 1,
        name: 'Math 101',
        inviteCode: 'ABCD1234',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @Post() createClass(@Body() dto: ClassDto, @Req() req) {
    return this.classesService.createClass(dto, req.user);
  }

  @UseGuards(ClassesAdminGuard)
  @ApiOperation({ summary: 'Update class details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class updated successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        id: 1,
        name: 'Math 101 - Updated',
        inviteCode: 'ABCD1234',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    example: {
      success: false,
      statusCode: 403,
      message: 'Admin access to class denied',
    },
  })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @Patch(':id') updateClass(@Body() dto: ClassDto, @Param('id') id: number) {
    return this.classesService.updateClass(dto, id);
  }

  @UseGuards(ClassesAdminGuard)
  @ApiOperation({ summary: 'Delete class by ID' })
  @ApiResponse({
    status: 200,
    description: 'Class deleted successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        id: 1,
        name: 'Math 101',
        inviteCode: 'ABCD1234',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    example: {
      success: false,
      statusCode: 403,
      message: 'Admin access to class denied',
    },
  })
  
  @UseGuards(ClassesAdminGuard)
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @Delete(':id') deleteClass(@Param('id') id: number) {
    return this.classesService.deleteClass(id);
  }

  @UseGuards(ClassesAdminGuard)
  @ApiOperation({ summary: 'Get invite code for a class by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Invite code retrieved successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        inviteCode: 'ABCD1234',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    example: {
      success: false,
      statusCode: 403,
      message: 'Admin access to class denied',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Class not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Class not found',
    },
  })
  @Get(':id/invite') getInviteCode(@Param('id') id: number) {
    return this.invitesService.getInviteCode(id);
  }
 
  @UseGuards(AuthGuard, ClassesAdminGuard)
  @ApiOperation({ summary: 'Regenerate invite code for a class by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Invite code regenerated successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        inviteCode: 'WXYZ5678',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    example: {
      success: false,
      statusCode: 403,
      message: 'Admin access to class denied',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Class not found',
    example: {
      success: false,
      statusCode: 404,
      message: 'Class not found',
    },
  })
  @Put(':id/invite') regenerateInviteCode(@Param('id') id: number) {
    return this.invitesService.regenerateInviteCode(id);
  }

  @ApiOperation({ summary: 'Join a class via invite code' })
  @ApiParam({ name: 'inviteCode', type: String, description: 'Invite Code' })
  @ApiResponse({
    status: 200,
    description: 'Joined class successfully',
    example: {
      success: true,
      statusCode: 200,
      data: {
        classUser: {
          id: 1,
          classId: 2,
          userId: 3,
          role: 'member'
        }
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid invite code',
    example: {
      success: false,
      statusCode: 404,
      message: 'Invalid invite code',
    },
  })
  @Post('join/:inviteCode') joinClassViaInviteCode(@Param('inviteCode') inviteCode: string, @Req() req) {
    return this.invitesService.joinClassViaInviteCode(inviteCode, req.user);
  }

  @ApiOperation({ summary: 'Leave a class by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Left class successfully',
    example: {
      success: true,
      statusCode: 200,
      message: 'Left class successfully',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    example: {
      success: false,
      statusCode: 401,
      message: 'Invalid or missing authorization token',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Class not found or user not part of the class',
    example: {
      success: false,
      statusCode: 404,
      message: 'Class not found or user not part of the class',
    },
  })
  @Post(':id/leave') leaveClass(@Param('id') id: number, @Req() req) {
    return this.invitesService.leaveClass(id, req.user);
  }
}