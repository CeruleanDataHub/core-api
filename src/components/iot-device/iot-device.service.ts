import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IoTDevice } from './iot-device.entity';

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

    findWhere(query: object): Promise<IoTDevice[]> {
        return this.IoTDeviceRepository.find(query);
    }

    async remove(id: string): Promise<void> {
        await this.IoTDeviceRepository.delete(id);
    }
}
