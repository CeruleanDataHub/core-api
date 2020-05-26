import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, getManager, DeleteResult } from 'typeorm';
import axios from 'axios';

import { Hierarchy } from './hierarchy.entity';

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
            if (hierarchy.parent) {
                const parent = await manager.findOne(Hierarchy, {
                    where: {
                        parent_id: hierarchy.parent,
                    },
                });
                newHierarchy = await manager.save(hierarchy);
                const childPath = parent.path + newHierarchy.uuid + '/';
                newHierarchy.path = childPath;
                delete newHierarchy.modified;
                await manager.update(
                    Hierarchy,
                    {
                        id: newHierarchy.id,
                    },
                    newHierarchy,
                );
            } else {
                newHierarchy = await manager.save(hierarchy);
            }

            const token = await this.getToken();
            const allScopes = await axios({
                method: 'GET',
                url: `${process.env.AUTH0_API}/resource-servers/${process.env.AUTH0_APP_SERVER_ID}`,
                headers: { authorization: 'Bearer ' + token },
            })
                .then(resp => resp.data.scopes)
                .catch(_ => {
                    throw new BadRequestException();
                });

            axios({
                method: 'PATCH',
                url: `${process.env.AUTH0_API}/resource-servers/${process.env.AUTH0_APP_SERVER_ID}`,
                headers: { authorization: 'Bearer ' + token },
                data: {
                    scopes: [
                        ...allScopes,
                        {
                            value: `uuid:${newHierarchy.uuid}`,
                            description: `permission for ${newHierarchy.uuid}`,
                        },
                    ],
                },
            }).catch(_ => {
                throw new BadRequestException();
            });

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

    async update(id: string, hierarchy: any): Promise<UpdateResult> {
        if (hierarchy.parent === '-1') {
            if (!hierarchy.uuid) {
                const child = await this.HierarchyRepository.findOne(id);
                hierarchy.uuid = child.uuid;
            }
            hierarchy.path = hierarchy.uuid + '/';
            hierarchy.parent = null;
            return this.HierarchyRepository.update(id, hierarchy);
        }
        const parent = await this.HierarchyRepository.findOne(hierarchy.parent);
        if (!hierarchy.uuid) {
            const child = await this.HierarchyRepository.findOne(id);
            hierarchy.uuid = child.uuid;
        }
        hierarchy.path = parent.path + hierarchy.uuid + '/';
        return this.HierarchyRepository.update(id, hierarchy);
    }

    async remove(id: string): Promise<string> {
        const respResult: DeleteResult = await this.HierarchyRepository.delete(
            id,
        );

        if (!respResult || respResult.affected === 0) {
            throw new BadRequestException();
        }
        return `No of affected rows: ${respResult.affected}`;
    }
}
