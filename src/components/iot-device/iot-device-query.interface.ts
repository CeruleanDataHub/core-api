type DeviceWhereClause = {
    id:  string | null,
    address: string | null,
    edgeDevice: string | null
}

type DeviceOrderClause = {
    id:  "ASC" | "DESC" | null,
    address: "ASC" | "DESC" | null,
    edgeDevice: "ASC" | "DESC" | null
}

export interface IoTQueryObjectType {
    select: ("edgeDevice" | "id" | "address")[],
    relations: Array<string>,
    where: DeviceWhereClause,
    order: DeviceOrderClause,
    skip: number | null,
    take: number | null,
    cache: boolean | null
}