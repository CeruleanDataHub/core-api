import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/')
    getBase(): string {
        return this.appService.getBaseApi();
    }

    @Get('/api')
    getBaseAPI(): string {
        return this.appService.getBaseApi();
    }
}
