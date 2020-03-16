import { Controller, Get, Post, Body } from '@nestjs/common';
import { Between, FindOperator } from 'typeorm';

import { TelemetryService } from './telemetry.service';
import { Telemetry } from './telemetry.entity';
import { TelemetryQueryObjectType } from './telemetry-query.interface';

@Controller('/api/telemetry')
export class TelemetryController {
    handleMinMax(
        whereClause: string | FindOperator<string> | null,
    ): string | FindOperator<string> | null {
        if (Array.isArray(whereClause)) {

            const [min, max] = whereClause;
            const envMin = +process.env.MIN;
            const envMax = +process.env.MAX;
            const genericMin = -9999;
            const genericMax = 9999;

            const queryMin = min ? min : envMin ? envMin : genericMin;
            const queryMax = max ? max : envMax ? envMax : genericMax;

            return Between(queryMin, queryMax);
        }
        return whereClause;
    }

    constructor(private readonly telemetryService: TelemetryService) {}

    @Get('/all')
    async getBaseAPI(): Promise<Telemetry[]> {
        return await this.telemetryService.findAll();
    }

    @Post('/find-where')
    async postFindWhere(
        @Body() telemetryQueryObject: TelemetryQueryObjectType,
    ): Promise<Telemetry[]> {
        // TODO input validation

        if (telemetryQueryObject.where) {
            if(telemetryQueryObject.where.temperature) {
                telemetryQueryObject.temperature = this.handleMinMax(
                    telemetryQueryObject.where.temperature,
                );
            }
            if(telemetryQueryObject.where.humidity) {
                telemetryQueryObject.humidity = this.handleMinMax(
                    telemetryQueryObject.where.humidity,
                );
            }
            if(telemetryQueryObject.where.pressure) {
                telemetryQueryObject.pressure = this.handleMinMax(
                    telemetryQueryObject.where.pressure,
                );
            }
            if(telemetryQueryObject.where.txpower) {
                telemetryQueryObject.txpower = this.handleMinMax(
                    telemetryQueryObject.where.txpower,
                );
            }
            if(telemetryQueryObject.where.rssi) {
                telemetryQueryObject.rssi = this.handleMinMax(
                    telemetryQueryObject.where.rssi,
                );
            }
            if(telemetryQueryObject.where.voltage) {
                telemetryQueryObject.voltage = this.handleMinMax(
                    telemetryQueryObject.where.voltage,
                );
            }
            delete telemetryQueryObject.where;
        }
        console.log(telemetryQueryObject);

        return await this.telemetryService.findWhere(telemetryQueryObject);
    }
}
