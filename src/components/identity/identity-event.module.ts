import { Module } from '@nestjs/common';
import { IdentityEventController } from './identity-event.controller';

@Module({
    controllers: [IdentityEventController],
})
export class IdentityEvent {}
