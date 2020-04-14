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
        let tableName = newSchema.name;
        const columns = newSchema.columns;
        await entityManager.transaction(async manager => {
            await manager.query("SELECT denim_telemetry.denim_telemetry_create_table($1)", [tableName]);
            columns.forEach(async col => {
                const colQuery = col.name + " " + col.type;
                await manager.query("SELECT denim_telemetry.denim_telemetry_alter_table($1, $2)", [tableName, colQuery]);
            });
        });
    }
}
