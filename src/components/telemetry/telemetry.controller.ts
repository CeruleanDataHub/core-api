import { Controller, Post, Body } from '@nestjs/common';
import { Between, FindOperator } from 'typeorm';
import { TelemetryService } from './telemetry.service';
import { TelemetryStatusGateway } from './telemetry-status.gateway';
import { ApiProperty } from '@nestjs/swagger';

class NameTypeObject {
    @ApiProperty()
    name: string;
    @ApiProperty()
    type: string;
}

class NewSchemaDto {
    @ApiProperty()
    name: string;
    @ApiProperty({ type: [NameTypeObject] })
    columns: NameTypeObject[];
}

@Controller('/telemetry')
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
    async postNewSchema(@Body() newSchema: NewSchemaDto): Promise<any> {
        await this.telemetryService.postNewSchema(newSchema);
    }

    @Post('/')
    async insertTelemetry(@Body() postBody: any): Promise<any> {
        const decodedJson = Buffer.from(postBody.data.body, 'base64').toString(
            'utf8',
        );
        const data = JSON.parse(decodedJson);

        this.telemetryStatusGateway.sendDeviceData(data.address, {
            telemetry: data,
            level: postBody.data.properties.level,
        });

        return this.telemetryService.save(data);
    }

    /*
        {
            table: TABLENAME,
            startDate: DATE,
            endDate: DATE,
            columns: [
                COLUMS,
                ARRAY
            ]
        }
    */
    @Post('/telemetry-query')
    async postQuery(
        @Body() postBody: any
    ): Promise<any> {
        return await this.telemetryService.postTelemetryQuery(postBody);
    }
}
