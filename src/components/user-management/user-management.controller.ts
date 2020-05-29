import { ApiProperty, ApiOperation, ApiTags } from '@nestjs/swagger';
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
    async getUsers() {
        return this.userManagementService.getUsers();
    }

    @Post('/users')
    @ApiOperation({ summary: 'Insert user' })
    async createUser(@Body() createUser: CreateUserDto) {
        return this.userManagementService.createUser(createUser);
    }

    @Get('/roles')
    @ApiOperation({ summary: 'Get roles' })
    async getRoles() {
        return this.userManagementService.getRoles();
    }

    @Get('/user/:id/roles')
    @ApiOperation({ summary: 'Get roles of user' })
    async getUserRoles(@Param('id') id: string) {
        return this.userManagementService.getUserRoles(id);
    }

    @Get('/user/:id')
    @ApiOperation({ summary: 'Get user' })
    async getUser(@Param('id') id: string) {
        return this.userManagementService.getUser(id);
    }

    @Put('/user/:id/roles')
    @ApiOperation({ summary: 'Add roles to user' })
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
    async getUsersOfARole(@Param('id') role_id: string) {
        return this.userManagementService.getUsersOfARole(role_id);
    }
}
