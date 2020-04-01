import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Telemetry } from './telemetry.entity';
import { Repository, getManager } from 'typeorm';
import { TelemetryQueryObjectType } from './telemetry-query.interface';

@Injectable()
export class TelemetryService {
    constructor(
        @InjectRepository(Telemetry)
        private readonly TelemetryRepository: Repository<Telemetry>,
    ) {}

    findAll(): Promise<Telemetry[]> {
        return this.TelemetryRepository.find({relations: ['iotDevice']});
    }

    findOne(id: string): Promise<Telemetry> {
        return this.TelemetryRepository.findOne(id);
    }

    findWhere(query: TelemetryQueryObjectType): Promise<Telemetry[]> {
        return this.TelemetryRepository.find(query);
    }

    async remove(id: string): Promise<void> {
        await this.TelemetryRepository.delete(id);
    }

    async postNewSchema( 
        newSchema: any, //TODO object type
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
