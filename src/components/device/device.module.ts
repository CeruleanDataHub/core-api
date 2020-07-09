import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { TwinController } from './twin.controller';
import { Device } from './device.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Device])],
    providers: [DeviceService],
    controllers: [DeviceController, TwinController],
    exports: [DeviceService]
})
export class DeviceModule {}
