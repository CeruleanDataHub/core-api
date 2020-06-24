import { Injectable } from '@nestjs/common';
import { getManager, InsertResult } from 'typeorm';
import { Device, DeviceType } from '../device/device.entity';
import {
    TelemetryQuery,
    TelemetryRow,
    AggregateTelemetryQuery,
    AggregateTelemetryRow
} from './telemetry.controller';
const moment = require('moment-timezone');

@Injectable()
export class TelemetryService {
    async insert(data): Promise<InsertResult> {
        const entityManager = getManager();

        const externalId = data.address;

        const device = await entityManager.findOne(Device, {
            where: {
                external_id: data.address,
                type: DeviceType.Node,
            },
        });

        if (!device) {
            throw Error(`No device with external_id ${externalId} found`);
        }

        const sensors = await entityManager
            .createQueryBuilder()
            .select(['s.id', 's.name', 's.value_type'])
            .from('sensor','s')
            .where('s.device_enrollment_group_id = :device_enrollment_group_id', {
                device_enrollment_group_id: device.deviceEnrollmentGroupId,
            }).getRawMany();

        const keys = Object.keys(data);

        const telemetry = [];

        for (let i=0;i<keys.length;i++) {

            const sensorName = keys[i];

            if (['time','address'].includes(sensorName)) { continue; }

            const sensor = sensors.find((s) => s.name == sensorName);

            if (!sensor) {
                console.error(`No sensor with device_enrollment_group_id ${device.deviceEnrollmentGroupId} and name ${sensorName} found, skipping...`);
                continue;
            }

            const valueType = sensor.value_type;

            const row = {
                time: data.time,
                device_id: device.id,
                sensor_id: sensor['id'],
                value_double: null,
                value_int: null,
                value_string: null
            };

            switch(valueType) {
                case 'double':
                    row.value_double = data[sensorName];
                    break;
                case 'integer':
                    row.value_int = data[sensorName];
                    break;
                case 'string':
                    row.value_string = data[sensorName];
                    break;
                default:
                  throw Error(`Invalid value_type ${sensor.value_type}`)
            }

            telemetry.push(row);
        }

        return await entityManager
            .createQueryBuilder()
            .insert()
            .into('telemetry', ['time', 'device_id', 'sensor_id', 'value_double', 'value_int', 'value_string'])
            .values(telemetry)
            .execute();
    }

    async query(query: TelemetryQuery): Promise<TelemetryRow[]> {
        const entityManager = getManager();

        const dbQuery = entityManager
            .createQueryBuilder()
            .select([
                'time',
                'device_id AS "deviceId"',
                's.name AS "sensorName"',
                's.unit',
                's.value_type AS "valueType"',
                'value_double AS "valueDouble"',
                'value_int AS "valueInt"',
                'value_string AS "valueString"'
            ])
            .from('telemetry','t')
            .innerJoin('sensor', 's', 't.sensor_id = s.id')
            .where('t.device_id = :device_id AND s.name = :sensor_name', {
                device_id: query.deviceId,
                sensor_name: query.sensorName
            });

        if (query.startDate) {
            dbQuery.andWhere('time >= :start_date', { start_date: query.startDate });
        }

        if (query.endDate) {
            dbQuery.andWhere('time <= :end_date', { end_date: query.endDate });
        }

        if (query.order) {
            if (query.order.time) {
                dbQuery.orderBy('time', query.order.time);
            }
        }

        if (query.limit) {
            dbQuery.limit(query.limit);
        }

        return await dbQuery.getRawMany();
    }

    async queryAggregate(query: AggregateTelemetryQuery): Promise<AggregateTelemetryRow[]> {
        const entityManager = getManager();

        const aggregateViews = {
            'HOURLY': 'telemetry_hourly',
            'DAILY': 'telemetry_daily',
            'WEEKLY': 'telemetry_weekly'
        }

        const aggregateView = aggregateViews[query.type];

        const dbQuery = entityManager
            .createQueryBuilder()
            .select([
                'time',
                'device_id AS "deviceId"',
                's.name AS "sensorName"',
                's.unit',
                's.value_type AS "valueType"',
                'avg_value_double AS "avgValueDouble"',
                'max_value_double AS "maxValueDouble"',
                'min_value_double AS "minValueDouble"',
                'avg_value_int AS "avgValueInt"',
                'max_value_int AS "maxValueInt"',
                'min_value_int AS "minValueInt"'
            ])
            .from(aggregateView, 't')
            .innerJoin('sensor', 's', 't.sensor_id = s.id')
            .where('t.device_id = :device_id AND s.name = :sensor_name', {
                device_id: query.deviceId,
                sensor_name: query.sensorName
            });

        if (query.startDate) {
            dbQuery.andWhere('time >= :start_date', { start_date: query.startDate });
        }

        if (query.endDate) {
            dbQuery.andWhere('time <= :end_date', { end_date: query.endDate });
        }

        if (query.order) {
            if (query.order.time) {
                dbQuery.orderBy('time', query.order.time);
            }
        }

        if (query.limit) {
            dbQuery.limit(query.limit);
        }

        return await dbQuery.getRawMany();
    }
}
