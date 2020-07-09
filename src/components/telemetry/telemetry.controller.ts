import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryStatusGateway } from './telemetry-status.gateway';
import { ApiProperty, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

class TelemetryRowOrder {
    @ApiProperty({ example: 'DESC'} )
    time:  'ASC' | 'DESC';
}

export class TelemetryQuery {
    @ApiProperty({ example: 1 })
    deviceId: number
    @ApiProperty({ example: 'temperature' })
    sensorName: string;
    @ApiProperty({ required: false })
    startDate: Date;
    @ApiProperty({ required: false })
    endDate: Date;
    @ApiProperty({ required: false })
    order: TelemetryRowOrder;
    @ApiProperty({ example: 10, required: false })
    limit: number;
}

export class TelemetryRow {
    @ApiProperty()
    time: Date;
    @ApiProperty()
    deviceId: number;
    @ApiProperty()
    sensorName: string;
    @ApiProperty()
    unit: string;
    @ApiProperty()
    valueType: string;
    @ApiProperty()
    valueDouble: number;
    @ApiProperty()
    valueInt: number;
    @ApiProperty()
    valueString: string;
}

export class AggregateTelemetryQuery extends TelemetryQuery {
    @ApiProperty({ example: 'HOURLY' })
    type: 'HOURLY' | 'DAILY' | 'WEEKLY'
}

export class AggregateTelemetryRow {
    @ApiProperty()
    time: Date;
    @ApiProperty()
    deviceId: number;
    @ApiProperty()
    sensorName: string;
    @ApiProperty()
    unit: string;
    @ApiProperty()
    valueType: string;
    @ApiProperty()
    avgValueDouble: number;
    @ApiProperty()
    maxValueDouble: number;
    @ApiProperty()
    minValueDouble: number;
    @ApiProperty()
    avgValueInt: number;
    @ApiProperty()
    maxValueInt: number;
    @ApiProperty()
    minValueInt: number;
}

@Controller('/telemetry')
@ApiTags('telemetry')
export class TelemetryController {
    constructor(
        private readonly telemetryService: TelemetryService,
        private readonly telemetryStatusGateway: TelemetryStatusGateway,
    ) {}

    @Post('/')
    @ApiOperation({ summary: 'Insert telemetry data' })
    @ApiResponse({status: HttpStatus.CREATED, description: 'Telemetry data inserted' })
    async insertTelemetry(@Body() postBody: any): Promise<any> {
        const decodedJson = Buffer.from(postBody.data.body, 'base64').toString(
            'utf8',
        );
        const data = JSON.parse(decodedJson);

        this.telemetryStatusGateway.sendDeviceData(data.address, {
            telemetry: data,
            level: postBody.data.properties.level,
        });

        return this.telemetryService.insert(data);
    }

    @Post('/query')
    @ApiOperation({ summary: 'Query telemetry data' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK, type: TelemetryRow, isArray: true, description: 'Success' })
    async queryTelemetry(@Body() query: TelemetryQuery): Promise<TelemetryRow[]> {
        return await this.telemetryService.query(query);
    }

    @Post('/query-aggregate')
    @ApiOperation({ summary: 'Query aggregate telemetry data' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({status: HttpStatus.OK, type: AggregateTelemetryRow, isArray: true, description: 'Success' })
    async queryAggregateTelemetry(@Body() query: AggregateTelemetryQuery): Promise<AggregateTelemetryRow[]> {
        return await this.telemetryService.queryAggregate(query);
    }
}
