import { Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryController } from './telemetry.controller';
import { TelemetryStatusGateway } from './telemetry-status.gateway';
import { DeviceModule } from '../device/device.module'; 

@Module({
    imports: [DeviceModule],
    providers: [TelemetryService, TelemetryStatusGateway],
    controllers: [TelemetryController],
})
export class TelemetryModule {}
