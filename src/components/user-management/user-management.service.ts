import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { CreateUserDto } from './user-management.controller';

@Injectable()
export class UserManagementService {
    async getToken() {
        return axios({
            method: 'post',
            url: 'https://denim-data-hub.eu.auth0.com/oauth/token',
            data: {
                grant_type: 'client_credentials',
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                audience: `${process.env.BASE_API}/`,
            },
        })
            .then(resp => {
                return resp.data.access_token;
            })
            .catch(err => console.log(err));
    }

    async getUsers() {
        const token = await this.getToken();
        return axios({
            method: 'GET',
            url: `${process.env.BASE_API}/users`,
            headers: { authorization: 'Bearer ' + token },
        }).then(resp => resp.data);
    }

    async getRoles() {
        const token = await this.getToken();
        return axios({
            method: 'GET',
            url: `${process.env.BASE_API}/roles`,
            headers: { authorization: 'Bearer ' + token },
        }).then(resp => resp.data);
    }

    async getUser(id: string) {
        const token = await this.getToken();
        const userPromise = axios({
            method: 'GET',
            url: `${process.env.BASE_API}/users/${id}?fields=user_id%2Cemail%2Cname&include_fields=true`,
            headers: { authorization: 'Bearer ' + token },
        }).then(resp => resp.data);

        const rolePromise = this.getUserRoles(id);

        return Promise.all([userPromise, rolePromise]).then(([user, roles]) => {
            user.roles = roles;
            return user;
        });
    }
    async getUserRoles(id: string) {
        const token = await this.getToken();
        return axios({
            method: 'GET',
            url: `${process.env.BASE_API}/users/${id}/roles`,
            headers: { authorization: 'Bearer ' + token },
        }).then(resp => resp.data);
    }

    async createUser(createUser: CreateUserDto) {
        const { email, password, roles } = createUser;
        const token = await this.getToken();
        try {
            const userCreationResponse = await axios({
                method: 'POST',
                url: `${process.env.BASE_API}/users`,
                headers: {
                    authorization: 'Bearer ' + token,
                },
                data: {
                    connection: 'Username-Password-Authentication',
                    email: email,
                    password: password,
                },
            });

            const userData = userCreationResponse.data;
            if (!Array.isArray(roles)) {
                return 'user created without a role';
            }
            const roleIds = await this.setRoleForAUser(
                userData.user_id,
                roles,
                token,
            );
            return `user created with the roles ${roleIds}`;
        } catch (err) {
            throw new BadRequestException(err.response.data);
        }
    }

    async addRolesToAUser(userId: any, roles: any) {
        const token = await this.getToken();
        const roleIds = await this.setRoleForAUser(userId, roles, token);
        return `Roleid ${roleIds} assigned to the user`;
    }

    async removeRolesFromAUser(userId: string, roles: string[]) {
        const token = await this.getToken();
        await axios({
            method: 'DELETE',
            url: `${process.env.BASE_API}/users/${userId}/roles`,
            headers: {
                authorization: 'Bearer ' + token,
            },
            data: {
                roles: roles,
            },
        });
        return `Roleid ${roles} removed from the user`;
    }

    async setRoleForAUser(userId: string, roles: string[], token: string) {
        await axios({
            method: 'POST',
            url: `${process.env.BASE_API}/users/${userId}/roles`,
            headers: {
                authorization: 'Bearer ' + token,
            },
            data: {
                roles: roles,
            },
        });
        return roles;
    }
    async getUsersOfARole(role_id: string) {
        const token = await this.getToken();
        const resp = await axios({
            method: 'GET',
            url: `${process.env.BASE_API}/roles/${role_id}/users`,
            headers: {
                authorization: 'Bearer ' + token,
            },
        });
        return resp.data;
    }
}
