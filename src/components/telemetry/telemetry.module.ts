import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { Telemetry } from './telemetry.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Telemetry])],
    providers: [TelemetryService],
    controllers: [TelemetryController],
})
export class TelemetryModule {}
