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
    NotFoundException,
} from '@nestjs/common';

import { Hierarchy } from './hierarchy.entity';
import { HierarchyService } from './hierarchy.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { HierarchyQueryObjectType } from './hierarchy-query.interface';

@Controller('/hierarchy')
@ApiTags('hierarchy')
export class HierarchyController {
    constructor(private readonly hierarchyService: HierarchyService) {}

    @Get('/all')
    @ApiOperation({ summary: 'Get all hierarchies' })
    @ApiResponse({status: HttpStatus.OK,  type: Hierarchy, isArray: true, description: 'Success' })
    async getAll(): Promise<Hierarchy[]> {
        return await this.hierarchyService.findAll();
    }
    @Get('/tree')
    @ApiOperation({ summary: 'Get all hierarchies as a tree' })
    @ApiResponse({status: HttpStatus.OK, type: Hierarchy, isArray: true, description: 'Success' })
    async getTree(): Promise<object[]> {
        return await this.hierarchyService.getTree();
    }
    @Post('/')
    @ApiOperation({ summary: 'Insert hierarchy' })
    @ApiResponse({status: HttpStatus.CREATED, type: Hierarchy, description: 'Hierarchy inserted' })
    async insert(@Body() hierarchy: Hierarchy): Promise<Hierarchy> {
        return await this.hierarchyService.insert(hierarchy);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get hierarchy' })
    @ApiResponse({status: HttpStatus.OK, type: Hierarchy, description: 'Success' })
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'Hierarchy not found' })
    async get(@Param('id') id: string): Promise<Hierarchy> {
        const hierarchy = await this.hierarchyService.find(id);
        if (!hierarchy) {
            throw new NotFoundException();
        }
        return Promise.resolve(hierarchy);
    }

    @Post('/find-where')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Find hierarchies' })
    @ApiResponse({status: HttpStatus.OK,  type: Hierarchy, isArray: true, description: 'Success' })
    async postFindWhere(@Body() queryObject: HierarchyQueryObjectType ): Promise<Hierarchy[]> {
        return await this.hierarchyService.findWhere(queryObject);
    }

    @Put('/:id')
    @ApiOperation({ summary: 'Update hierarchy' })
    @ApiResponse({status: HttpStatus.OK, description: 'Hierarchy updated' })
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'Hierarchy not found' })
    async update(
        @Param('id') id: string,
        @Body() hierarchy: Hierarchy,
    ): Promise<any> {
        return await this.hierarchyService.update(id, hierarchy);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Remove hierarchy' })
    @ApiResponse({status: HttpStatus.OK, description: 'Hierarchy removed' })
    @ApiResponse({status: HttpStatus.NOT_FOUND, description: 'Hierarchy not found' })
    async remove(@Param('id') id: string): Promise<any> {
        return await this.hierarchyService.remove(id);
    }
}
