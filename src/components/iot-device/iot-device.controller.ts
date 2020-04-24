import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
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

    @Post('/register')
    @HttpCode(HttpStatus.OK)
    async register(
        @Body() body: any
    ): Promise<void> {
        console.log("Register device");
        const decodedJson = Buffer.from(body.data.body, 'base64').toString('utf8');
        const data = JSON.parse(decodedJson);
        return await this.ioTDeviceService.register(data.address, data.edgeDeviceId);
    }
}
