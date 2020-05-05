import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { EdgeDeviceService } from './edgeDevice.service';
import { EdgeDevice } from './edgeDevice.entity';
import { EdgeQueryObjectType } from './edgeDevice-query.interface';

@Controller('/edge')
export class EdgeDeviceController {
    constructor(private readonly edgeDeviceService: EdgeDeviceService) {}

    @Get('/all')
    async getAll(): Promise<EdgeDevice[]> {
        return await this.edgeDeviceService.findAll();
    }

    @Post('/find-where')
    async postFindWhere(
        @Body() edgeQueryObjectType: EdgeQueryObjectType,
    ): Promise<EdgeDevice[]> {
        // TODO input validation
        return await this.edgeDeviceService.findWhere(edgeQueryObjectType);
    }

    @Post('/')
    async insert(@Body() edgeDevice: EdgeDevice): Promise<EdgeDevice> {
        return await this.edgeDeviceService.insert(edgeDevice);
    }

    @Delete('/:id')
    async remove(@Param('id') id: string): Promise<void> {
        return await this.edgeDeviceService.remove(id);
    }
}
