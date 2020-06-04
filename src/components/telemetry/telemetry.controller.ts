import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Between, FindOperator } from 'typeorm';
import { TelemetryService } from './telemetry.service';
import { TelemetryStatusGateway } from './telemetry-status.gateway';
import { ApiProperty, ApiOperation, ApiTags } from '@nestjs/swagger';

class NameTypeObject {
    @ApiProperty()
    name: string;
    @ApiProperty()
    type: string;
}

export class NewSchemaDto {
    @ApiProperty()
    name: string;
    @ApiProperty({ type: [NameTypeObject] })
    columns: NameTypeObject[];
}

export class TelemetryQueryDto {
    @ApiProperty({ example: 'ruuvi_telemetry' })
    table: string;
    @ApiProperty()
    startDate: Date;
    @ApiProperty()
    endDate: Date;
    @ApiProperty({ example: ['time', 'temperature'] })
    columns: string[];
}

export class TelemetryLatestDto {
    @ApiProperty({ example: 'ruuvi_telemetry' })
    table: string;
    @ApiProperty({ example: ['time', 'temperature'] })
    columns: string[];
    @ApiProperty()
    limit: number;
}

@Controller('/telemetry')
@ApiTags('telemetry')
export class TelemetryController {
    constructor(
        private readonly telemetryService: TelemetryService,
        private readonly telemetryStatusGateway: TelemetryStatusGateway,
    ) {}

    // if request's where contains arrays(min, max) use typeorm's Between(), otherwise return as is
    handleBetween(
        whereClause: string | FindOperator<string> | null,
    ): string | FindOperator<string> | null {
        if (Array.isArray(whereClause)) {
            const [min, max] = whereClause;
            return Between(min, max);
        }
        return whereClause;
    }

    /*
        {
            name: RUUVITAG,
            columns: [
                {name: TEMPERATURE, type: NUMERIC}
            ]
        }
     */
    @Post('/new-schema')
    @ApiOperation({ summary: 'Insert telemetry schema' })
    async postNewSchema(@Body() newSchema: NewSchemaDto): Promise<any> {
        await this.telemetryService.postNewSchema(newSchema);
    }

    @Post('/')
    @ApiOperation({ summary: 'Insert telemetry data' })
    async insertTelemetry(@Body() postBody: any): Promise<any> {
        const decodedJson = Buffer.from(postBody.data.body, 'base64').toString(
            'utf8',
        );
        const data = JSON.parse(decodedJson);

        this.telemetryStatusGateway.sendDeviceData(data.address, {
            telemetry: data,
            level: postBody.data.properties.level,
        });

        this.telemetryService.save(data);
    }

    @Post('/telemetry-query')
    @ApiOperation({ summary: 'Query telemetry data' })
    @HttpCode(HttpStatus.OK)
    async postQuery(@Body() query: TelemetryQueryDto): Promise<object[]> {
        return await this.telemetryService.postTelemetryQuery(query);
    }

    @Post('/telemetry-latest')
    @ApiOperation({ summary: 'Query latest telemetry data' })
    @HttpCode(HttpStatus.OK)
    async latestTelemetry(
        @Body() query: TelemetryLatestDto,
    ): Promise<object[]> {
        return await this.telemetryService.latestTelemetry(query);
    }
}
