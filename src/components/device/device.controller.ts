import { Controller, Get, Post, Body, HttpCode, HttpStatus, Delete, Param } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Device } from './device.entity';
import { DeviceQueryObjectType } from './device-query.interface';

@Controller('/device')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) {}

    @Get('/all')
    async getAll(): Promise<Device[]> {
        return await this.deviceService.findAll();
    }

    @Post('/find-where')
    async postFindWhere(@Body() queryObject: DeviceQueryObjectType ): Promise<Device[]> { // TODO input validation
        return await this.deviceService.findWhere(queryObject);
    }

    @Post('/')
    async insert(@Body() device: Device): Promise<Device> {
        return await this.deviceService.insert(device);
    }

    @Delete('/:id')
    async remove(@Param('id') id: string): Promise<any> {
        return await this.deviceService.remove(id);
    }

    @Post('/register')
    @HttpCode(HttpStatus.OK)
    async register(
        @Body() body: any
    ): Promise<void> {
        console.log("Register device");
        const decodedJson = Buffer.from(body.data.body, 'base64').toString('utf8');
        const data = JSON.parse(decodedJson);
        return await this.deviceService.register(data.address, data.edgeDeviceId);
    }
}
