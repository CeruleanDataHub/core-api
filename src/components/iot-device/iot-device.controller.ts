import { Controller, Get, Post, Body } from '@nestjs/common';
import { IoTDeviceService } from './iot-device.service';
import { IoTDevice } from './iot-device.entity';
import { IoTQueryObjectType } from './iot-device-query.interface';

@Controller('/api/iot-device')
export class IoTDeviceController {
    constructor(private readonly ioTDeviceService: IoTDeviceService) {}

    @Get('/all')
    async getBaseAPI(): Promise<IoTDevice[]> {
        return await this.ioTDeviceService.findAll();
    }

    @Post('/find-where')
    async postFindWhere(@Body() iotQueryObject: IoTQueryObjectType ): Promise<IoTDevice[]> { // TODO input validation
        return await this.ioTDeviceService.findWhere(iotQueryObject);
    }
}
