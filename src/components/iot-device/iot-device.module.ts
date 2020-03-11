import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IoTDeviceService } from './iot-device.service';
import { IoTDeviceController } from './iot-device.controller';
import { IoTDevice } from './iot-device.entity';

@Module({
    imports: [TypeOrmModule.forFeature([IoTDevice])],
    providers: [IoTDeviceService],
    controllers: [IoTDeviceController],
})
export class IoTDeviceModule {}
