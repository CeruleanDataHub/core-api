import {
    Module,
    NestModule,
    MiddlewareConsumer,
    RequestMethod,
} from '@nestjs/common';
import { UserManagementModule } from './components/user-management/user-management.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EdgeDevice } from './components/edge-device/edgeDevice.entity';
import { EdgeDeviceModule } from './components/edge-device/edgeDevice.module';
import { IoTDevice } from './components/iot-device/iot-device.entity';
import { IoTDeviceModule } from './components/iot-device/iot-device.module';
import { Telemetry } from './components/telemetry/telemetry.entity';
import { TelemetryModule } from './components/telemetry/telemetry.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CorsMiddleware } from './middleware/cors-middleware';
import { WebhookValidationMiddleware } from './middleware/webhook-validation-middleware';

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
            ssl:
                process.env.NODE_ENV !== 'dev'
                    ? { rejectUnauthorized: true }
                    : null,
            namingStrategy: new SnakeNamingStrategy(),
        }),
        EdgeDeviceModule,
        IoTDeviceModule,
        TelemetryModule,
        UserManagementModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(WebhookValidationMiddleware).forRoutes({
            path: '/api/iot-device/register',
            method: RequestMethod.OPTIONS,
        });
        consumer.apply(WebhookValidationMiddleware).forRoutes({
            path: '/api/telemetry',
            method: RequestMethod.OPTIONS,
        });
        consumer.apply(CorsMiddleware).forRoutes('*');
    }
}
