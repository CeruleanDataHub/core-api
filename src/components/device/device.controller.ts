import { Controller, Get, Post, Body, HttpCode, HttpStatus, Delete, Param } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Device } from './device.entity';
import { DeviceQueryObjectType } from './device-query.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/device')
@ApiTags('device')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) {}

    @Get('/all')
    @ApiOperation({ summary: 'Get all devices' })
    async getAll(): Promise<Device[]> {
        return await this.deviceService.findAll();
    }

    @Post('/find-where')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Find devices' })
    async postFindWhere(@Body() queryObject: DeviceQueryObjectType ): Promise<Device[]> { // TODO input validation
        return await this.deviceService.findWhere(queryObject);
    }

    @Post('/')
    @ApiOperation({ summary: 'Insert device' })
    async insert(@Body() device: Device): Promise<Device> {
        return await this.deviceService.insert(device);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Remove device' })
    async remove(@Param('id') id: string): Promise<any> {
        return await this.deviceService.remove(id);
    }

    @Post('/register')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Register device' })
    async register(
        @Body() body: any
    ): Promise<void> {
        console.log("Register device");
        const decodedJson = Buffer.from(body.data.body, 'base64').toString('utf8');
        const data = JSON.parse(decodedJson);
        return await this.deviceService.register(data.address, data.edgeDeviceId, data.callbackModule, data.callbackMethod);
    }
}
