import { UpdateResult } from 'typeorm';
import {
    Controller,
    Get,
    Body,
    Post,
    Param,
    Put,
    Delete,
} from '@nestjs/common';

import { Hierarchy } from './hierarchy.entity';
import { HierarchyService } from './hierarchy.service';

@Controller('/hierarchy')
export class HierarchyController {
    constructor(private readonly hierarchyService: HierarchyService) {}

    @Get('/all')
    async getAll(): Promise<Hierarchy[]> {
        return await this.hierarchyService.findAll();
    }
    @Get('/tree')
    async getTree(): Promise<object[]> {
        return await this.hierarchyService.getTree();
    }
    @Post('/')
    async insert(@Body() hierarchy: Hierarchy): Promise<Hierarchy> {
        return await this.hierarchyService.insert(hierarchy);
    }

    @Get('/:id')
    async get(@Param('id') id: string): Promise<Hierarchy> {
        return await this.hierarchyService.find(id);
    }

    @Put('/:id')
    async update(
        @Param('id') id: string,
        @Body() hierarchy: Hierarchy,
    ): Promise<UpdateResult> {
        return await this.hierarchyService.update(id, hierarchy);
    }

    @Delete('/:id')
    async remove(@Param('id') id: string): Promise<any> {
        return await this.hierarchyService.remove(id);
    }
}
