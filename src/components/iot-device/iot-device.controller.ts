import { Controller, Get } from '@nestjs/common';
import { IoTDeviceService } from './iot-device.service';
import { IoTDevice } from './iot-device.entity';

@Controller('/api/iot-device')
export class IoTDeviceController {
    constructor(private readonly ioTDeviceService: IoTDeviceService) {}

    @Get('/all')
    async getBaseAPI(): Promise<IoTDevice[]> {
        return await this.ioTDeviceService.findAll();
    }
}
