import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import { Device, DeviceType } from '../device/device.entity';
import { TelemetryQueryDto, NewSchemaDto } from './telemetry.controller';

@Injectable()
export class TelemetryService {

    async save(data) {

        const entityManager = getManager();

        const device = await entityManager.findOne(Device, {
            where: {
                external_id: data.address,
                type: DeviceType.Node
            }
        });

        if (!device) {
            throw Error(`No device with external id ${data.address} found`);
        }

        const { payload_table_name } = await entityManager.createQueryBuilder()
            .select("g.payload_table_name")
            .from("device_enrollment_group", "g")
            .innerJoin("device", "d", "d.device_enrollment_group_id = g.id")
            .where("d.id = :id", { id: device.id })
            .getRawOne();

        const telemetry = { ...data, device_id: device.id }
        delete telemetry.address;

        await entityManager.createQueryBuilder()
            .insert()
            .into(`denim_telemetry.${payload_table_name}`)
            .values(telemetry)
            .execute();
    }

    async postNewSchema(
        newSchema: NewSchemaDto,
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

    async postTelemetryQuery(query: TelemetryQueryDto): Promise<object[]> {
        const entityManager = getManager();
        const tableName = query.table;
        const startDate = new Date(query.startDate).getTime() / 1000;
        const endDate = new Date(query.endDate).getTime() / 1000;
        const columns = query.columns;
        let result = null;
        await entityManager.transaction(async manager => {
            await manager.query("SELECT denim_telemetry.telemetry_query('cursor', $1, to_timestamp($2), to_timestamp($3), $4);",
                [tableName, startDate, endDate, columns]);
            result = await manager.query("FETCH ALL IN cursor");
        });
        return result;
    }
}
