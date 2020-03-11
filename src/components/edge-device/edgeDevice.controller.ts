import { Controller, Get } from '@nestjs/common';
import { EdgeDeviceService } from './edgeDevice.service';
import { EdgeDevice } from './edgeDevice.entity';

@Controller('/api/edge')
export class EdgeDeviceController {
    constructor(private readonly edgeDeviceService: EdgeDeviceService) {}

    @Get('/all')
    async getBaseAPI(): Promise<EdgeDevice[]> {
        return await this.edgeDeviceService.findAll();
    }
}
