import { Controller, Get, Post, Body } from '@nestjs/common';
import { Between, FindOperator, getManager } from 'typeorm';
import { TelemetryService } from './telemetry.service';
import { Telemetry } from './telemetry.entity';
import { TelemetryQueryObjectType, TelemetryProperties } from './telemetry-query.interface';

@Controller('/api/telemetry')
export class TelemetryController {

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
        const entityManager = getManager();
        const typeName = "type_" + newSchema.name;
        const typeColumnsArr = newSchema.columns.map(val => val.name + " " + val.type)
        const typeColumns = typeColumnsArr.join(", ");
        const typeQuery = `CREATE TYPE ${typeName} AS (${typeColumns});`
        await entityManager.query(typeQuery);

        const tableName = "telemetry_" + newSchema.name
        const teleQuery = `CREATE TABLE ${tableName} (
            telemetry_id text,
            payload ${typeName}
        );`
        /* 
            CONSTRAINT fk_${tableName}
                FOREIGN KEY (telemetry_id) REFERENCES telemetry(id)
        */
       await entityManager.query(teleQuery);
    }

}
