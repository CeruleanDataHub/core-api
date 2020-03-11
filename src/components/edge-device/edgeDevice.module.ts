import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdgeDeviceService } from './edgeDevice.service';
import { EdgeDeviceController } from './edgeDevice.controller';
import { EdgeDevice } from './edgeDevice.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EdgeDevice])],
    providers: [EdgeDeviceService],
    controllers: [EdgeDeviceController],
})
export class EdgeDeviceModule {}
