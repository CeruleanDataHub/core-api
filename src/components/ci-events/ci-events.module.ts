import { Module } from '@nestjs/common';
import { CiEventsController } from './ci-events.controller';

@Module({
    controllers: [CiEventsController],
})
export class CiEventsModule {}
