import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app && app.close());
    }
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);
}

bootstrap();
