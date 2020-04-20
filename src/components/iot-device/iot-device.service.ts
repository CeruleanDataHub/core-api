import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoTDevice } from './iot-device.entity';
import { IoTQueryObjectType } from './iot-device-query.interface';
import { getManager } from 'typeorm';
import { registerDevice, sendDeviceDoesNotExist, sendDeviceRegistrationSuccess } from './iot-device-register';

@Injectable()
export class IoTDeviceService {
    constructor(
        @InjectRepository(IoTDevice)
        private readonly IoTDeviceRepository: Repository<IoTDevice>,
    ) {}

    findAll(): Promise<IoTDevice[]> {
        return this.IoTDeviceRepository.find({relations: ['edgeDevice']});
    }

    findOne(id: string): Promise<IoTDevice> {
        return this.IoTDeviceRepository.findOne(id);
    }

    findWhere(query: IoTQueryObjectType): Promise<IoTDevice[]> {
        return this.IoTDeviceRepository.find(query);
    }

    async remove(id: string): Promise<void> {
        await this.IoTDeviceRepository.delete(id);
    }

    async register(address: string, edgeDeviceId: string): Promise<void> {
        const entityManager = getManager();
        await entityManager.transaction(async manager => {
            const addressAvailableResult = await manager.query("SELECT 1 FROM iot_devices i WHERE i.id=$1 AND i.edge_device_id IS NULL AND EXISTS(SELECT e.id FROM edge_devices e WHERE e.id=$2)",
                [address, edgeDeviceId]);
            if (addressAvailableResult.length === 1) {
                const value = await registerDevice(address, edgeDeviceId);
                console.log('After registering the device with the callback, the returned values is ', value);
                console.log('updating the iot_device in the db');
                if (value.wasSuccessful) {
                    await manager.query('UPDATE iot_devices SET edge_device_id = $1 WHERE id = $2', [value.edgeDeviceId, value.registrationId]);
                    sendDeviceRegistrationSuccess(address, edgeDeviceId);
                }
            } else {
                const idsMatch = await manager.query('SELECT 1 FROM iot_devices i WHERE i.id=$1 and i.edge_device_id=$2', 
                    [address, edgeDeviceId]);
                if (idsMatch.length === 1) {
                    sendDeviceRegistrationSuccess(address, edgeDeviceId);
                } else {
                    sendDeviceDoesNotExist(address, edgeDeviceId);
                }
            }
        });
    }
}
