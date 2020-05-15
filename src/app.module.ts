import {
    NestModule,
    MiddlewareConsumer,
    RequestMethod,
    DynamicModule,
} from '@nestjs/common';
import { UserManagementModule } from './components/user-management/user-management.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Device } from './components/device/device.entity';
import { DeviceModule } from './components/device/device.module';
import { TelemetryModule } from './components/telemetry/telemetry.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CorsMiddleware } from './middleware/cors-middleware';
import { WebhookValidationMiddleware } from './middleware/webhook-validation-middleware';
import { HealthModule } from './components/health/health.module';

export function getOrmConfig(): TypeOrmModuleOptions {

    let ssl: boolean | object = false;
    if (process.env.PGSSL === "true") {
        ssl = {
            rejectUnauthorized: true
        }
        if (process.env.PGCACERT) {
            // PGCACERT env var is expected to contain the ca-cert as base64 encoded string
            ssl["ca"] = Buffer.from(process.env.PGCACERT, 'base64').toString();
        }
    }

    return {
        type: 'postgres',
        host: process.env.PGHOST,
        port: +process.env.PGPORT,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        entities: [Device],
        ssl: ssl,
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
    };
}

export class AppModule implements NestModule {
    public static forRoot(): DynamicModule {
        return {
            module: AppModule,
            imports: [
                TypeOrmModule.forRoot(getOrmConfig()),
                DeviceModule,
                TelemetryModule,
                UserManagementModule,
                HealthModule,
            ],
            controllers: [AppController],
            providers: [AppService],
        };
    }
    configure(consumer: MiddlewareConsumer) {
        const webhookUrls = ['/device/register', '/telemetry'];
        for (const webhookUrl of webhookUrls) {
            consumer.apply(WebhookValidationMiddleware).forRoutes({
                path: webhookUrl,
                method: RequestMethod.OPTIONS,
            });
        }
        consumer.apply(CorsMiddleware).forRoutes('*');
    }
}
