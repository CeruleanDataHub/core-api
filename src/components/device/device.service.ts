import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { DeviceQueryObjectType } from './device-query.interface';
import { getManager } from 'typeorm';
import { registerDevice, sendEdgeDeviceDoesNotExist, sendDeviceRegistrationSuccess, sendDeviceAlreadyAssigned } from './device-register';

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly DeviceRepository: Repository<Device>,
    ) {}

    findAll(): Promise<Device[]> {
        return this.DeviceRepository.find({relations: ['parent']});
    }

    findOne(id: string): Promise<Device> {
        return this.DeviceRepository.findOne(id);
    }

    findWhere(query: DeviceQueryObjectType): Promise<Device[]> {
        return this.DeviceRepository.find(query);
    }

    async remove(id: string): Promise<void> {
        await this.DeviceRepository.delete(id);
    }

    async insert(device: Device): Promise<Device> {
        return await this.DeviceRepository.save(device);
    }

    async register(deviceExternalId: string, edgeDeviceExternalId: string): Promise<void> {
        const entityManager = getManager();
        await entityManager.transaction(async manager => {

            const edgeDevicesByExternalId = await manager.find(Device, {
                where: {
                    external_id: edgeDeviceExternalId,
                    type: 'edge'
                }
            });

            if (edgeDevicesByExternalId.length > 1) {
                throw Error(`Multiple edge devices with external id ${edgeDeviceExternalId} found`);
            }

            if (edgeDevicesByExternalId.length === 0) {
                sendEdgeDeviceDoesNotExist(deviceExternalId, edgeDeviceExternalId);
                return;
            }

            const edgeDevice = edgeDevicesByExternalId[0];

            let devicesByExternalId = await manager.find(Device, {
                where: {
                    external_id: deviceExternalId,
                    type: 'node'
                },
                relations: ['parent']
            });

            if (devicesByExternalId.length > 1) {
                throw Error(`Multiple devices with external id ${deviceExternalId} found`);
            }

            let device = devicesByExternalId.length === 0 ? false : devicesByExternalId[0];

            if (!device) {
                const newDevice = new Device();
                newDevice.external_id = deviceExternalId;
                newDevice.name = deviceExternalId;
                newDevice.type = 'node';
                newDevice.deviceEnrollmentGroupId = edgeDevice.deviceEnrollmentGroupId;
                device = await manager.save(newDevice);
            }

            if (!device.parent) {
                try {
                    await registerDevice(deviceExternalId);
                    console.log(`Device ${deviceExternalId} registered succesfully. Updating the device in db...`);
                    device.parent = edgeDevice;
                    device.status = 'active';
                    await manager.save(device);
                    sendDeviceRegistrationSuccess(deviceExternalId, edgeDeviceExternalId);
                } catch (err) {
                    console.log("Error registering device", err);
                }
            } else {
                if (device.parent.id === edgeDevice.id) {
                    // Already registered to the edge device
                    sendDeviceRegistrationSuccess(deviceExternalId, edgeDeviceExternalId);
                } else {
                    // Registered to other edge device
                    sendDeviceAlreadyAssigned(deviceExternalId, edgeDeviceExternalId);
                }
            }
        });
    }
}
