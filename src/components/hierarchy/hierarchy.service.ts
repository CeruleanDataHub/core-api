import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getManager } from 'typeorm';
import axios from 'axios';

import { Hierarchy } from './hierarchy.entity';
import { HierarchyQueryObjectType } from './hierarchy-query.interface';

@Injectable()
export class HierarchyService {
    constructor(
        @InjectRepository(Hierarchy)
        private readonly HierarchyRepository: Repository<Hierarchy>,
    ) {}

    async getToken() {
        return axios({
            method: 'post',
            url: process.env.AUTH0_TOKEN_API,
            data: {
                grant_type: 'client_credentials',
                client_id: process.env.AUTH0_CLIENT_ID,
                client_secret: process.env.AUTH0_CLIENT_SECRET,
                audience: `${process.env.AUTH0_API}/`,
            },
        })
            .then(resp => {
                return resp.data.access_token;
            })
            .catch(err => console.log(err));
    }

    async insert(h: Hierarchy): Promise<Hierarchy> {
        const hierarchy: Hierarchy = Object.assign(new Hierarchy(), h);
        let newHierarchy;

        delete hierarchy.id;
        delete hierarchy.uuid;
        delete hierarchy.created;
        delete hierarchy.modified;

        const entityManager = getManager();
        return await entityManager.transaction(async manager => {
            newHierarchy = await manager.save(hierarchy);

            const allScopes = await this.getAllScopes();

            const scopes = [
                ...allScopes,
                {
                    value: `uuid:${newHierarchy.uuid}:read`,
                    description: `read permission for ${newHierarchy.uuid}`,
                },
                {
                    value: `uuid:${newHierarchy.uuid}:write`,
                    description: `write permission for ${newHierarchy.uuid}`,
                },
                {
                    value: `uuid:${newHierarchy.uuid}:execute`,
                    description: `execute permission for ${newHierarchy.uuid}`,
                },
            ];

            this.setPermissions(scopes);

            return newHierarchy;
        });
    }

    findAll(): Promise<Hierarchy[]> {
        return this.HierarchyRepository.find();
    }

    treeify(list) {
        const idAttr = 'id';
        const parentAttr = 'parent';
        const childrenAttr = 'children';

        var treeList = [];
        var lookup = {};
        list.forEach(obj => {
            lookup[obj[idAttr]] = obj;
            obj[childrenAttr] = [];
        });
        list.forEach(obj => {
            if (obj[parentAttr] != null) {
                lookup[obj[parentAttr]][childrenAttr].push(obj);
            } else {
                treeList.push(obj);
            }
        });
        return treeList;
    }

    async getTree(): Promise<object[]> {
        const allHierarchies = await this.HierarchyRepository.find({
            relations: ['parent'],
        });

        const treeBasedHierarchy: object[] = allHierarchies.map(hier => {
            const h: any = { ...hier };
            h.title = h.name;
            h.subtitle = h.description;
            h.expanded = true;
            if (h.parent) {
                h.parent = h.parent.id;
            }
            return h;
        });
        return this.treeify(treeBasedHierarchy);
    }

    find(id): Promise<Hierarchy> {
        return this.HierarchyRepository.findOne(id);
    }

    findWhere(query: HierarchyQueryObjectType): Promise<Hierarchy[]> {
        return this.HierarchyRepository.find(query);
    }

    async update(id: string, hierarchy: any): Promise<any> {
        const entityManager = getManager();

        return await entityManager.transaction(async manager => {
            const hierarchyToUpdate = await manager.findOne(Hierarchy, id);
            if (!hierarchyToUpdate) {
                throw new NotFoundException();
            }
            manager.update(Hierarchy, { id: id }, hierarchy);
        });
    }

    getAllScopes = async () => {
        return await axios({
            method: 'GET',
            url: `${process.env.AUTH0_API}/resource-servers/${process.env.AUTH0_APP_SERVER_ID}`,
            headers: { authorization: 'Bearer ' + (await this.getToken()) },
        })
            .then(resp => resp.data.scopes)
            .catch(err => {
                console.log('Error getting scopes', err);
                throw new InternalServerErrorException();
            });
    };

    setPermissions = async scopes => {
        return await axios({
            method: 'PATCH',
            url: `${process.env.AUTH0_API}/resource-servers/${process.env.AUTH0_APP_SERVER_ID}`,
            headers: { authorization: 'Bearer ' + (await this.getToken()) },
            data: {
                scopes: scopes,
            },
        }).catch(err => {
            console.log('Error setting permissions', err);
            throw new InternalServerErrorException();
        });
    };

    async remove(id: string): Promise<any> {
        const entityManager = getManager();

        return await entityManager.transaction(async manager => {
            const hierarchyToDelete = await manager.findOne(Hierarchy, id);
            if (!hierarchyToDelete) {
                throw new NotFoundException();
            }
            await manager.delete(Hierarchy, id);

            const allScopes = await this.getAllScopes();

            const uuidToDelete = hierarchyToDelete.uuid;
            const filteredScopes = allScopes.filter(
                scope => !scope.value.includes(uuidToDelete),
            );

            this.setPermissions(filteredScopes);
        });
    }
}
