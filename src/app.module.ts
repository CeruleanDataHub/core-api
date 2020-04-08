import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdgeDevice } from './components/edge-device/edgeDevice.entity';
import { EdgeDeviceModule } from './components/edge-device/edgeDevice.module';
import { IoTDevice } from './components/iot-device/iot-device.entity';
import { IoTDeviceModule } from './components/iot-device/iot-device.module';
import { Telemetry } from './components/telemetry/telemetry.entity';
import { TelemetryModule } from './components/telemetry/telemetry.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.PGHOST,
        port: +process.env.PGPORT,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        entities: [EdgeDevice, IoTDevice, Telemetry],
        synchronize: false,
        ssl: { rejectUnauthorized: true },
      }),
      EdgeDeviceModule,
      IoTDeviceModule,
      TelemetryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
