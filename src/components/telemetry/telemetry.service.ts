import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Telemetry } from './telemetry.entity';
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
}
