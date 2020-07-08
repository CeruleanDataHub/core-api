import {
    NestModule,
    MiddlewareConsumer,
    RequestMethod,
    DynamicModule,
} from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { CorsMiddleware } from './middleware/cors-middleware';
import { WebhookValidationMiddleware } from './middleware/webhook-validation-middleware';

import { AppService } from './app.service';
import { CiEventsModule } from './components/ci-events/ci-events.module';
import { Device } from './components/device/device.entity';
import { DeviceModule } from './components/device/device.module';
import { UserManagementModule } from './components/user-management/user-management.module';
import { TelemetryModule } from './components/telemetry/telemetry.module';
import { HierarchyModule } from './components/hierarchy/hierarchy.module';
import { Hierarchy } from './components/hierarchy/hierarchy.entity';
import { IdentityEvent } from './components/identity/identity-event.module';
import { HealthModule } from './components/health/health.module';

export function getOrmConfig(): TypeOrmModuleOptions {
    let ssl: boolean | object = false;
    if (process.env.PGSSL === 'true') {
        ssl = {
            rejectUnauthorized: true,
        };
        if (process.env.PGCACERT) {
            // PGCACERT env var is expected to contain the ca-cert as base64 encoded string
            ssl['ca'] = Buffer.from(process.env.PGCACERT, 'base64').toString();
        }
    }

    return {
        type: 'postgres',
        host: process.env.PGHOST,
        port: +process.env.PGPORT,
        username: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        entities: [Device, Hierarchy],
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
                HierarchyModule,
                HealthModule,
                IdentityEvent,
                CiEventsModule,
            ],
            providers: [AppService],
        };
    }
    configure(consumer: MiddlewareConsumer) {
        const webhookUrls = [
            '/device/register',
            '/telemetry',
            '/identity-event',
            '/cloud-ci-events',
        ];
        for (const webhookUrl of webhookUrls) {
            consumer.apply(WebhookValidationMiddleware).forRoutes({
                path: webhookUrl,
                method: RequestMethod.OPTIONS,
            });
        }
        consumer.apply(CorsMiddleware).forRoutes('*');
    }
}
