import { Controller, Get, Post, Body } from '@nestjs/common';
import { Between, FindOperator } from 'typeorm';
import { TelemetryService } from './telemetry.service';
import { Telemetry } from './telemetry.entity';
import { TelemetryQueryObjectType, TelemetryProperties } from './telemetry-query.interface';
import { IoTDevice } from '../iot-device/iot-device.entity';
import { TelemetryStatusGateway } from './telemetry-status.gateway';

@Controller('/api/telemetry')
export class TelemetryController {
    
    constructor(
        private readonly telemetryService: TelemetryService, 
        private readonly telemetryStatusGateway:  TelemetryStatusGateway
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

    @Get('/all')
    async getBaseAPI(): Promise<Telemetry[]> {
        return await this.telemetryService.findAll();
    }

    @Post('/find-where')
    async postFindWhere(
        @Body() telemetryQueryObject: TelemetryQueryObjectType,
    ): Promise<Telemetry[]> {
        // TODO input validation

        if(telemetryQueryObject.where) {
            for (const val in telemetryQueryObject.where) {
                telemetryQueryObject.where[val] = this.handleBetween(telemetryQueryObject.where[val]);
            }
        } else {
            for (const val in telemetryQueryObject){
                if(TelemetryProperties.includes(val)){
                    telemetryQueryObject[val] = this.handleBetween(telemetryQueryObject[val]);
                }
            }
        }
        console.log(telemetryQueryObject);
        return await this.telemetryService.findWhere(telemetryQueryObject);
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
    async postNewSchema(
        @Body() newSchema: any, //TODO object type
    ): Promise<any> {
        await this.telemetryService.postNewSchema(newSchema);
    }

    @Post('/')
    async insertTelemetry(
        @Body() body: any
    ): Promise<any> {
        const decodedJson = Buffer.from(body.data.body, 'base64').toString('utf8');
        const data = JSON.parse(decodedJson);
        const { time, address, temperature, humidity, pressure, txpower, rssi, voltage } = data;

        this.telemetryStatusGateway.sendDeviceData(address, { 
            telemetry: data,
            level: body.data.properties.level,
        });

        const iotDevice = new IoTDevice();
        iotDevice.id = address;

        const telemetry = new Telemetry();
        telemetry.time = time;
        telemetry.temperature = temperature;
        telemetry.humidity = humidity;
        telemetry.pressure = pressure;
        telemetry.txpower = txpower;
        telemetry.rssi = rssi;
        telemetry.voltage = voltage;
        telemetry.iotDevice = iotDevice;

        await this.telemetryService.save(telemetry);
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
