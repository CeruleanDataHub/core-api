import { ApiProperty, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { UserManagementService } from './user-management.service';

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    BadRequestException,
    HttpStatus,
} from '@nestjs/common';

export class CreateUserDto {
    @ApiProperty()
    email: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    roles: string[];
}

@Controller('/user-management')
@ApiTags('user')
export class UserManagementController {
    constructor(
        private readonly userManagementService: UserManagementService,
    ) {}

    @Get('/users')
    @ApiOperation({ summary: 'Get users' })
    @ApiResponse({status: HttpStatus.OK, description: 'Success' })
    async getUsers() {
        return this.userManagementService.getUsers();
    }

    @Post('/users')
    @ApiOperation({ summary: 'Insert user' })
    @ApiResponse({status: HttpStatus.CREATED, description: 'User inserted' })
    async createUser(@Body() createUser: CreateUserDto) {
        return this.userManagementService.createUser(createUser);
    }

    @Get('/roles')
    @ApiOperation({ summary: 'Get roles' })
    @ApiResponse({status: HttpStatus.OK, description: 'Success' })
    async getRoles() {
        return this.userManagementService.getRoles();
    }

    @Get('/user/:id/roles')
    @ApiOperation({ summary: 'Get roles of user' })
    @ApiResponse({status: HttpStatus.OK, description: 'Success' })
    async getUserRoles(@Param('id') id: string) {
        return this.userManagementService.getUserRoles(id);
    }

    @Get('/user/:id')
    @ApiOperation({ summary: 'Get user' })
    @ApiResponse({status: HttpStatus.OK, description: 'Success' })
    async getUser(@Param('id') id: string) {
        return this.userManagementService.getUser(id);
    }

    @Put('/user/:id/roles')
    @ApiOperation({ summary: 'Add roles to user' })
    @ApiResponse({status: HttpStatus.OK, description: 'Roles added' })
    async addRolesToAUser(
        @Param('id') user_id: string,
        @Body() roles: string[],
    ) {
        if (!Array.isArray(roles) || roles.length === 0) {
            throw new BadRequestException('Roles must be an array');
        }
        return this.userManagementService.addRolesToAUser(user_id, roles);
    }

    @Delete('/user/:id/roles')
    @ApiOperation({ summary: 'Remove roles from user' })
    @ApiResponse({status: HttpStatus.OK, description: 'Roles removed' })
    async removeRolesFromAUser(
        @Param('id') user_id: string,
        @Body() roles: string[],
    ) {
        if (!Array.isArray(roles) || roles.length === 0) {
            throw new BadRequestException('Roles must be an array');
        }
        return this.userManagementService.removeRolesFromAUser(user_id, roles);
    }

    @Get('/roles/:id/users')
    @ApiOperation({ summary: 'Get users of a role' })
    @ApiResponse({status: HttpStatus.OK, description: 'Success' })
    async getUsersOfARole(@Param('id') role_id: string) {
        return this.userManagementService.getUsersOfARole(role_id);
    }
}
