require('dotenv').config();

import { version } from '../package.json';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

declare const module: any;
async function bootstrap() {
    const app = await NestFactory.create(AppModule.forRoot());

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app && app.close());
    }

    // Handle requests with content-types "application/json" and "application/cloudevents+json"
    app.use(
        bodyParser.json({
            type: 'application/*',
        }),
    );

    const options = new DocumentBuilder()
        .setTitle('IoT Platform API')
        .setDescription('IoT platform api')
        .setVersion(version)
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/open-api', app, document);
    await app.listen(3000);
}

bootstrap();
