import {
    Controller,
    Get,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Delete,
    Param,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiTags,
    ApiResponse,
    ApiProperty,
} from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { Device } from './device.entity';
import { DeviceQueryObjectType } from './device-query.interface';

class RowOrder {
    @ApiProperty({ example: 'DESC' })
    time: 'ASC' | 'DESC';
}

export class AggregateActiveDeviceQuery {
    @ApiProperty({ required: false })
    startDate: Date;
    @ApiProperty({ required: false })
    endDate: Date;
    @ApiProperty({ required: false })
    order: RowOrder;
}

export class AggregateActiveDeviceRow {
    @ApiProperty()
    time: Date;
    @ApiProperty()
    activeDeviceCount: number;
}

export class AggregateActiveDevices {
    @ApiProperty()
    days: AggregateActiveDeviceRow[];
    @ApiProperty()
    total: number;
}

@Controller('/device')
@ApiTags('device')
export class DeviceController {
    constructor(private readonly deviceService: DeviceService) {}

    @Get('/all')
    @ApiOperation({ summary: 'Get all devices' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Device,
        isArray: true,
        description: 'Success',
    })
    async getAll(): Promise<Device[]> {
        return await this.deviceService.findAll();
    }

    @Post('/find-where')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Find devices' })
    @ApiResponse({
        status: HttpStatus.OK,
        type: Device,
        isArray: true,
        description: 'Success',
    })
    async postFindWhere(
        @Body() queryObject: DeviceQueryObjectType,
    ): Promise<Device[]> {
        // TODO input validation
        return await this.deviceService.findWhere(queryObject);
    }

    @Post('/')
    @ApiOperation({ summary: 'Insert device' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: Device,
        description: 'Device inserted',
    })
    async insert(@Body() device: Device): Promise<Device> {
        return await this.deviceService.insert(device);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Remove device' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Device removed' })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Device not found',
    })
    async remove(@Param('id') id: string): Promise<any> {
        return await this.deviceService.remove(id);
    }

    @Post('/register')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Register device' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Device registered' })
    async register(@Body() body: any): Promise<void> {
        console.log('Register device');
        const decodedJson = Buffer.from(body.data.body, 'base64').toString(
            'utf8',
        );
        const data = JSON.parse(decodedJson);
        return await this.deviceService.register(
            data.address,
            data.edgeDeviceId,
            data.callbackModule,
            data.callbackMethod,
        );
    }

    @Post('/device-activity')
    @ApiOperation({ summary: 'Query aggregate active device' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: AggregateActiveDevices,
        isArray: true,
        description: 'Returns aggregate active device data',
    })
    async queryUserActivity(
        @Body() query: AggregateActiveDeviceQuery,
    ): Promise<AggregateActiveDevices> {
        return await this.deviceService.queryDeviceActivity(query);
    }
}
