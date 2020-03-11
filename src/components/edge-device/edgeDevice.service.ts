import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EdgeDevice } from './edgeDevice.entity';

@Injectable()
export class EdgeDeviceService {
    constructor(
        @InjectRepository(EdgeDevice)
        private readonly edgeDeviceRepository: Repository<EdgeDevice>,
    ) {}

    findAll(): Promise<EdgeDevice[]> {
        return this.edgeDeviceRepository.find();
    }

    findOne(id: string): Promise<EdgeDevice> {
        return this.edgeDeviceRepository.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.edgeDeviceRepository.delete(id);
    }
}
