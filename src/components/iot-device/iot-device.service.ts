import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoTDevice } from './iot-device.entity';
import { IoTQueryObjectType } from './iot-device-query.interface';

@Injectable()
export class IoTDeviceService { // TODO refuses to return the edgeDeviceId from database, find out why
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
}
