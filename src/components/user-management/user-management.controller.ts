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
    email: string;
    password: string;
    roles: string[];
}
@Controller('/api/user-management')
export class UserManagementController {
    constructor(
        private readonly userManagementService: UserManagementService,
    ) {}

    @Post('/create-user')
    async createUser(@Body() createUser: CreateUserDto) {}

    @Get('/users')
    async getUsers() {
        return this.userManagementService.getUsers();
    }

    @Post('/users')
    async createUsers(@Body() createUser: CreateUserDto) {
        return this.userManagementService.createUsers(createUser);
    }

    @Get('/roles')
    async getRoles() {
        return this.userManagementService.getRoles();
    }

    @Get('/user/:id/roles')
    async getUserRoles(@Param('id') id) {
        return this.userManagementService.getUserRoles(id);
    }

    @Get('/user/:id')
    async getUser(@Param('id') id) {
        return this.userManagementService.getUser(id);
    }

    @Put('/user/:user_id/roles')
    async addRolesToAUser(
        @Param('user_id') user_id: string,
        @Body() roles: string[],
    ) {
        if (!Array.isArray(roles) || roles.length === 0) {
            throw new BadRequestException('Roles must be an array');
        }
        return this.userManagementService.addRolesToAUser(user_id, roles);
    }

    @Delete('/user/:user_id/roles')
    async removeRolesFromAUser(
        @Param('user_id') user_id: string,
        @Body() roles: string[],
    ) {
        if (!Array.isArray(roles) || roles.length === 0) {
            throw new BadRequestException('Roles must be an array');
        }
        return this.userManagementService.removeRolesFromAUser(user_id, roles);
    }

    @Get('/roles/:role_id/users')
    async getUsersOfARole(@Param('role_id') role_id: string) {
        return this.userManagementService.getUsersOfARole(role_id);
    }
}
