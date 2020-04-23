import { UserManagementService } from './user-management.service';
import {
    Controller,
    Get,
    Post,
    Body,
    BadRequestException,
    Param
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
}
