import { Injectable } from '@nestjs/common';
import { getManager } from 'typeorm';
import { Device, DeviceType } from '../device/device.entity';

@Injectable()
export class TelemetryService {

    async save(data): Promise<void> {

        const entityManager = getManager();

        let devicesByExternalId = await entityManager.find(Device, {
            where: {
                external_id: data.address,
                type: DeviceType.Node
            }
        });

        if (devicesByExternalId.length === 0) {
            throw Error(`No devices with external id ${data.address} found`);
        }
        
        if (devicesByExternalId.length > 1) {
            throw Error(`Multiple devices with external id ${data.address} found`);
        }

        let device = devicesByExternalId[0];

        entityManager.createQueryBuilder()
            .insert()
            .into("denim_telemetry.ruuvi_telemetry")
            .values([
                {
                    time: data.time,
                    temperature: data.temperature,
                    humidity: data.humidity,
                    pressure: data.pressure,
                    tx_power: data.txpower,
                    voltage: data.voltage,
                    rssi: data.rssi,
                    device_id: device.id
                },
            ])
            .execute();
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
