import { Controller, Get, Post, Body } from '@nestjs/common';
import { EdgeDeviceService } from './edgeDevice.service';
import { EdgeDevice } from './edgeDevice.entity';
import { EdgeQueryObjectType } from './edgeDevice-query.interface';

@Controller('/api/edge')
export class EdgeDeviceController {
    constructor(private readonly edgeDeviceService: EdgeDeviceService) {}

    @Get('/all')
    async getBaseAPI(): Promise<EdgeDevice[]> {
        return await this.edgeDeviceService.findAll();
    }

    @Post('/find-where')
    async postFindWhere(@Body() edgeQueryObjectType: EdgeQueryObjectType ): Promise<EdgeDevice[]> { // TODO input validation
        return await this.edgeDeviceService.findWhere(edgeQueryObjectType);
    }
}
