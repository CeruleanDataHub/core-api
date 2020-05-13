import { DeviceType } from './device.entity';

type DeviceWhereClause = {
    id:  string | null,
    external_id: string | null,
    parent_id: string | null,
    name: string | null,
    type: DeviceType.Node| DeviceType.Edge | null
}

type DeviceOrderClause = {
    id:  "ASC" | "DESC" | null,
    external_id: "ASC" | "DESC" | null,
    parent_id: "ASC" | "DESC" | null,
    name: "ASC" | "DESC" | null,
    type: "ASC" | "DESC" | null
}

export interface DeviceQueryObjectType {
    select: ("id" | "external_id" | "parent" | "name")[],
    relations: Array<string>,
    where: DeviceWhereClause,
    order: DeviceOrderClause,
    skip: number | null,
    take: number | null,
    cache: boolean | null
}
