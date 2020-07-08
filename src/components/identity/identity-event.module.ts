import { Module } from '@nestjs/common';
import { IdentityEventController } from './identity-event.controller';
import { IdentityEventService } from './identity-event.service';

@Module({
    controllers: [IdentityEventController],
    providers: [IdentityEventService],
})
export class IdentityEvent {}
