type EdgeWhereClause = {
    id:  string | null,
    name: string | null
}

type EdgeOrderClause = {
    id:  "ASC" | "DESC" | null,
    name: "ASC" | "DESC" | null
}

export interface EdgeQueryObjectType {
    select: ("id" | "name")[],
    relations: Array<string>,
    where: EdgeWhereClause,
    order: EdgeOrderClause,
    skip: number | null,
    take: number | null,
    cache: boolean | null
}