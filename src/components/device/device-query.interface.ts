import { DeviceType } from './device.entity';
import { ApiProperty } from '@nestjs/swagger';

class DeviceWhereClause {
    @ApiProperty({ required: false })
    id:  string | null;
    @ApiProperty({ required: false })
    external_id: string | null;
    @ApiProperty({ required: false })
    parent_id: string | null;
    @ApiProperty({ required: false })
    name: string | null;
    @ApiProperty({ required: false, example: DeviceType.Node })
    type: DeviceType.Node| DeviceType.Edge | null;
    @ApiProperty({ required: false })
    hierarchy_id: string;
}

class DeviceOrderClause {
    @ApiProperty({ required: false })
    id:  "ASC" | "DESC" | null;
    @ApiProperty({ required: false })
    external_id: "ASC" | "DESC" | null;
    @ApiProperty({ required: false })
    parent_id: "ASC" | "DESC" | null;
    @ApiProperty({ required: false })
    name: "ASC" | "DESC" | null;
    @ApiProperty({ required: false })
    type: "ASC" | "DESC" | null;
}

export class DeviceQueryObjectType {
    @ApiProperty({ required: false, example: ["id", "external_id", "type"] })
    select: ("id" | "external_id" | "parent" | "name" | "type" | "hierarchy_id" )[];
    @ApiProperty({ required: false, example: ["parent"] })
    relations: Array<string>;
    @ApiProperty({ required: false, example: { type: DeviceType.Node } })
    where: DeviceWhereClause;
    @ApiProperty({ required: false, example: { id: "ASC "} })
    order: DeviceOrderClause;
    @ApiProperty({ required: false, example: 0 })
    skip: number | null;
    @ApiProperty({ required: false, example: 5 })
    take: number | null;
    @ApiProperty({ required: false, example: false })
    cache: boolean | null;
}
