import { UpdateResult } from 'typeorm';
import {
    Controller,
    Get,
    Body,
    Post,
    Param,
    Put,
    Delete,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';

import { Hierarchy } from './hierarchy.entity';
import { HierarchyService } from './hierarchy.service';
import { ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { HierarchyQueryObjectType } from './hierarchy-query.interface';

@Controller('/hierarchy')
@ApiTags('hierarchy')
export class HierarchyController {
    constructor(private readonly hierarchyService: HierarchyService) {}

    @Get('/all')
    @ApiOperation({ summary: 'Get all hierarchies' })
    async getAll(): Promise<Hierarchy[]> {
        return await this.hierarchyService.findAll();
    }
    @Get('/tree')
    @ApiOperation({ summary: 'Get all hierarchies as a tree' })
    async getTree(): Promise<object[]> {
        return await this.hierarchyService.getTree();
    }
    @Post('/')
    @ApiOperation({ summary: 'Insert hierarchy' })
    async insert(@Body() hierarchy: Hierarchy): Promise<Hierarchy> {
        return await this.hierarchyService.insert(hierarchy);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get hierarchy' })
    async get(@Param('id') id: string): Promise<Hierarchy> {
        return await this.hierarchyService.find(id);
    }

    @Post('/find-where')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Find hierarchies' })
    async postFindWhere(@Body() queryObject: HierarchyQueryObjectType ): Promise<Hierarchy[]> {
        return await this.hierarchyService.findWhere(queryObject);
    }

    @Put('/:id')
    @ApiOperation({ summary: 'Update hierarchy' })
    async update(
        @Param('id') id: string,
        @Body() hierarchy: Hierarchy,
    ): Promise<UpdateResult> {
        return await this.hierarchyService.update(id, hierarchy);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Remove hierarchy' })
    async remove(@Param('id') id: string): Promise<string> {
        return await this.hierarchyService.remove(id);
    }
}
