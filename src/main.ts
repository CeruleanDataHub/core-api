import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
require('dotenv').config();

declare const module: any;
async function bootstrap() {
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app && app.close());
    }
    const app = await NestFactory.create(AppModule);
    // Handle requests with content-types "application/json" and "application/cloudevents+json"
    app.use(
        bodyParser.json({
            type: 'application/*',
        }),
    );
    app.setGlobalPrefix('api/v1');

    const options = new DocumentBuilder()
        .setTitle('IoT Platform API')
        .setDescription('IoT platform api')
        .setVersion('0.0.1')
        .setBasePath('/api/v1')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/api/v1', app, document);
    await app.listen(3000);
}

bootstrap();
