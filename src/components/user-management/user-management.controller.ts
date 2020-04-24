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

@Controller('/api/user-management')
export class UserManagementController {
    constructor(
        private readonly userManagementService: UserManagementService,
    ) {}

    @Post('/create-user')
    async createUser(@Body() createUserObjectType: any) {}

    @Get('/users')
    async getUsers() {
        return this.userManagementService.getUsers();
    }

    @Post('/users')
    async createUsers(@Body() credentialAndRoleObjectType: any) {
        return this.userManagementService.createUsers(
            credentialAndRoleObjectType,
        );
    }

    @Get('/roles')
    async getRoles() {
        return this.userManagementService.getRoles();
    }

    @Get('/user/:id/roles')
    async getUserRoles(@Param('id') id) {
        return this.userManagementService.getUserRoles(id);
    }

    @Put('/user/:user_id/roles')
    async addRolesToAUser(
        @Param('user_id') user_id: string,
        @Body() roles: any,
    ) {
        if (!Array.isArray(roles) || roles.length === 0) {
            throw new BadRequestException('Roles must be an array');
        }
        return this.userManagementService.addRolesToAUser(user_id, roles);
    }

    @Delete('/user/:user_id/roles')
    async removeRolesFromAUser(
        @Param('user_id') user_id: string,
        @Body() roles: any,
    ) {
        if (!Array.isArray(roles) || roles.length === 0) {
            throw new BadRequestException('Roles must be an array');
        }
        return this.userManagementService.removeRolesFromAUser(user_id, roles);
    }
}
