import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class UserManagementService {
    async getToken() {
        return axios({
            method: 'post',
            url: 'https://denim-data-hub.eu.auth0.com/oauth/token',
            data: {
                grant_type: 'client_credentials',
                client_id: 'FiLFy3rYoOjUer9Ekk9Qakm7jRJZ6lJh',
                client_secret:
                    'tUqwOKKb96iALLguJl7OrSmAcsEGJifMPGwaY4B-nonYQRuCX2_eDBvtZN_fZylQ',
                audience: 'https://denim-data-hub.eu.auth0.com/api/v2/',
            },
        })
            .then(resp => {
                return resp.data.access_token;
            })
            .catch(err => console.log());
    }

    async getUsers() {
        const token = await this.getToken();
        return axios({
            method: 'GET',
            url: 'https://denim-data-hub.eu.auth0.com/api/v2/users',
            headers: { authorization: 'Bearer ' + token },
        }).then(resp => resp.data);
    }

    async getRoles() {
        const token = await this.getToken();
        return axios({
            method: 'GET',
            url: 'https://denim-data-hub.eu.auth0.com/api/v2/roles',
            headers: { authorization: 'Bearer ' + token },
        }).then(resp => resp.data);
    }

    async getUserRoles(id: string) {
        const token = await this.getToken();
        return axios({
            method: 'GET',
            url: `https://denim-data-hub.eu.auth0.com/api/v2/users/${id}/roles`,
            headers: { authorization: 'Bearer ' + token },
        }).then(resp => resp.data);
    }

    async createUsers(credentialObjectType: any) {
        const { email, password, roles } = credentialObjectType;
        const token = await this.getToken();
        try {
            const userCreationResponse = await axios({
                method: 'POST',
                url: 'https://denim-data-hub.eu.auth0.com/api/v2/users',
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
                throw {
                    response: {
                        data:
                            'User created but no roles assigned, because roles must be in an array',
                    },
                };
            }
            const roleIds = this.setRoleForAUser(
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

    async removeRolesFromAUser(userId: any, roles: any) {
        const token = await this.getToken();
        const roleIds = await this.fetchRoleIds(roles);
        const removedIds = await axios({
            method: 'DELETE',
            url: `https://denim-data-hub.eu.auth0.com/api/v2/users/${userId}/roles`,
            headers: {
                authorization: 'Bearer ' + token,
            },
            data: {
                roles: roleIds,
            },
        });
        return `Roleid ${roleIds} removed from the user`;
    }

    async setRoleForAUser(userId: any, roles: any, token: any) {
        const roleIds = await this.fetchRoleIds(roles);
        await axios({
            method: 'POST',
            url: `https://denim-data-hub.eu.auth0.com/api/v2/users/${userId}/roles`,
            headers: {
                authorization: 'Bearer ' + token,
            },
            data: {
                roles: roleIds,
            },
        });
        return roleIds;
    }

    async fetchRoleIds(roles) {
        const allRoles: any = await this.getRoles();
        console.log(roles);
        let roleIds = allRoles.filter(role => {
            console.log(role);
            return roles.includes(role.name);
        });
        roleIds = roleIds.map(role => role.id);

        console.log(roleIds);
        return roleIds;
    }
}
