import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device, DeviceType, DeviceStatus } from './device.entity';
import { DeviceQueryObjectType } from './device-query.interface';
import { getManager } from 'typeorm';
import {
    registerDevice,
    sendEdgeDeviceDoesNotExist,
    sendDeviceRegistrationSuccess,
    sendDeviceAlreadyAssigned,
} from './device-register';
import { AggregateActiveDeviceQuery } from './device.controller';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly DeviceRepository: Repository<Device>,
    ) {}

    findAll(): Promise<Device[]> {
        return this.DeviceRepository.find({ relations: ['parent'] });
    }

    findOne(id: string): Promise<Device> {
        return this.DeviceRepository.findOne(id);
    }

    findWhere(query: DeviceQueryObjectType): Promise<Device[]> {
        return this.DeviceRepository.find(query);
    }

    async remove(id: string): Promise<any> {
        const entityManager = getManager();
        return await entityManager.transaction(async manager => {
            const device = await manager.findOne(Device, id);
            if (!device) {
                throw new NotFoundException();
            }
            return manager.delete(Device, { id: id });
        });
    }

    async insert(device: Device): Promise<Device> {
        return await this.DeviceRepository.save(device);
    }

    async register(
        deviceExternalId: string,
        edgeDeviceExternalId: string,
        callbackModule: string,
        callbackMethod: string,
    ) {
        const entityManager = getManager();
        return await entityManager.transaction(async manager => {
            const edgeDevice = await manager.findOne(Device, {
                where: {
                    external_id: edgeDeviceExternalId,
                    type: DeviceType.Edge,
                },
            });

            if (!edgeDevice) {
                sendEdgeDeviceDoesNotExist(
                    deviceExternalId,
                    edgeDeviceExternalId,
                    callbackModule,
                    callbackMethod,
                );
                return;
            }

            let device = await manager.findOne(Device, {
                where: {
                    external_id: deviceExternalId,
                    type: DeviceType.Node,
                },
                relations: ['parent'],
            });

            if (!device) {
                const newDevice = new Device();
                newDevice.external_id = deviceExternalId;
                newDevice.name = deviceExternalId;
                newDevice.type = DeviceType.Node;
                newDevice.deviceEnrollmentGroupId =
                    edgeDevice.deviceEnrollmentGroupId;
                device = await manager.save(newDevice);
            }

            if (!device.parent) {
                try {
                    await registerDevice(
                        deviceExternalId,
                        device.deviceEnrollmentGroupId,
                    );
                    console.log(
                        `Device ${deviceExternalId} registered succesfully. Updating the device in db...`,
                    );
                    device.parent = edgeDevice;
                    device.status = DeviceStatus.Active;
                    await manager.save(device);
                    sendDeviceRegistrationSuccess(
                        deviceExternalId,
                        edgeDeviceExternalId,
                        callbackModule,
                        callbackMethod,
                    );
                } catch (err) {
                    // Catch to avoid rolling back the transaction in case of something wrong in device provisioning service,
                    // configuration etc. If a new device was inserted, then it stays in the database with 'created' status.
                    console.log('Error registering device', err);
                }
            } else {
                if (device.parent.id === edgeDevice.id) {
                    // Already registered to the edge device
                    sendDeviceRegistrationSuccess(
                        deviceExternalId,
                        edgeDeviceExternalId,
                        callbackModule,
                        callbackMethod,
                    );
                } else {
                    // Registered to other edge device
                    sendDeviceAlreadyAssigned(
                        deviceExternalId,
                        edgeDeviceExternalId,
                        callbackModule,
                        callbackMethod,
                    );
                }
            }
        });
    }

    getDailyActiveDevices = async (
        query: AggregateActiveDeviceQuery,
        total: boolean,
    ) => {
        const dbActiveDeviceDaysQuery = getManager()
            .createQueryBuilder()
            .select(
                'CAST(COUNT(DISTINCT device_id) AS INTEGER) AS activeDeviceCount',
            );
        if (!total) {
            dbActiveDeviceDaysQuery.addSelect(['time']).groupBy('time');
        }
        dbActiveDeviceDaysQuery.from('telemetry_daily', 't');

        if (query.startDate) {
            dbActiveDeviceDaysQuery.andWhere('time >= :start_date', {
                start_date: query.startDate,
            });
        }

        if (query.endDate) {
            dbActiveDeviceDaysQuery.andWhere('time <= :end_date', {
                end_date: query.endDate,
            });
        }

        if (query.order) {
            if (query.order.time) {
                dbActiveDeviceDaysQuery.orderBy('time', query.order.time);
            }
        }

        return await dbActiveDeviceDaysQuery.execute();
    };

    async queryDeviceActivity(query: AggregateActiveDeviceQuery): Promise<any> {
        const dailyActiveDevices = await this.getDailyActiveDevices(
            query,
            false,
        );

        const totalActiveDevices = await this.getDailyActiveDevices(
            query,
            true,
        );
        return {
            days: dailyActiveDevices,
            total: totalActiveDevices[0].activeusercount,
        };
    }
}
