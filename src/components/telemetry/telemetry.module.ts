import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { Telemetry } from './telemetry.entity';
import { TelemetryStatusGateway } from './telemetry-status.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([Telemetry])],
    providers: [TelemetryService, TelemetryStatusGateway],
    controllers: [TelemetryController],
})
export class TelemetryModule {}
