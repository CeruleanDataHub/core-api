import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

declare const module: any;

async function bootstrap() {
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app && app.close());
    }
    const app = await NestFactory.create(AppModule);
    // Handle requests with content-types "application/json" and "application/cloudevents+json"
    app.use(bodyParser.json({
        type: 'application/*'
    }));
    await app.listen(3000);
}

bootstrap();
