import { ApiProperty } from '@nestjs/swagger';

class HierarchyWhereClause {
    @ApiProperty({ required: false })
    id:  string | null;
    @ApiProperty({ required: false })
    uuid: string | null;
    @ApiProperty({ required: false })
    parent_id: string | null;
    @ApiProperty({ required: false })
    type: string | null;
    @ApiProperty({ required: false })
    name: string | null;
}

class HierarchyOrderClause {
    @ApiProperty({ required: false })
    id:  "ASC" | "DESC" | null;
    @ApiProperty({ required: false })
    uuid: "ASC" | "DESC" | null;
    @ApiProperty({ required: false })
    parent_id: "ASC" | "DESC" | null;
    @ApiProperty({ required: false })
    type: "ASC" | "DESC" | null;
    @ApiProperty({ required: false })
    name: "ASC" | "DESC" | null;
}

export class HierarchyQueryObjectType {
    @ApiProperty({ required: false, example: ["id", "uuid", "name"] })
    select: ("id" | "uuid" | "parent" | "type" | "name")[];
    @ApiProperty({ required: false, example: ["parent"] })
    relations: Array<string>;
    @ApiProperty({ required: false, example: { id: 1 } })
    where: HierarchyWhereClause;
    @ApiProperty({ required: false, example: { id: "ASC "} })
    order: HierarchyOrderClause;
    @ApiProperty({ required: false, example: 0 })
    skip: number | null;
    @ApiProperty({ required: false, example: 5 })
    take: number | null;
    @ApiProperty({ required: false, example: false })
    cache: boolean | null;
}
