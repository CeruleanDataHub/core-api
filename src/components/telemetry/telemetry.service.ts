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
        return this.TelemetryRepository.find({ relations: ['iotDevice'] });
    }

    findOne(id: string): Promise<Telemetry> {
        return this.TelemetryRepository.findOne(id);
    }

    findWhere(query: TelemetryQueryObjectType): Promise<Telemetry[]> {
        return this.TelemetryRepository.find(query);
    }

    async save(telemetry: Telemetry): Promise<void> {
        await this.TelemetryRepository.save(telemetry);
    }

    async remove(id: string): Promise<void> {
        await this.TelemetryRepository.delete(id);
    }

    async postNewSchema(
        newSchema: any, //TODO object type
    ): Promise<any> {
        const entityManager = getManager();
        let tableName = newSchema.name;
        const columns = newSchema.columns;
        await entityManager.transaction(async manager => {
            await manager.query(
                'SELECT denim_telemetry.denim_telemetry_create_table($1)',
                [tableName],
            );
            columns.forEach(async col => {
                const colQuery = col.name + ' ' + col.type;
                await manager.query(
                    'SELECT denim_telemetry.denim_telemetry_alter_table($1, $2)',
                    [tableName, colQuery],
                );
            });
        });
    }


    async postTelemetryQuery(
        postBody: any, //TODO object type
    ): Promise<any> {
        const entityManager = getManager();
        const tableName = postBody.table;
        const startDate = new Date(postBody.startDate).getTime() / 1000;
        const endDate = new Date(postBody.endDate).getTime() / 1000;
        const columns = postBody.columns;
        let result = null;
        await entityManager.transaction(async manager => {
            await manager.query("SELECT denim_telemetry.telemetry_query('cursor', $1, to_timestamp($2), to_timestamp($3), $4);",
                [tableName, startDate, endDate, columns]);
            result = await manager.query("FETCH ALL IN \"cursor\"");
        });
        return result;
    }
}
