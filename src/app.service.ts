import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getBaseApi(): string {
        return 'API :)';
    }
}
