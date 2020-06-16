import { Controller, Post, Body } from '@nestjs/common';
import { ApiProperty, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getManager } from 'typeorm';
import { Stream } from 'stream';

const EVENT_SOURCE = 'auth0';

class Auth0EventData {
    @ApiProperty()
    date: Date;

    @ApiProperty()
    type: string;

    @ApiProperty()
    connection: string;

    @ApiProperty()
    connection_id: string;

    @ApiProperty()
    client_id: string;

    @ApiProperty()
    client_name: string;

    @ApiProperty()
    ip: string;

    @ApiProperty()
    user_agent: string;

    @ApiProperty()
    hostname: string;

    @ApiProperty()
    user_id: string;
    
    @ApiProperty()
    user_name: string;

    @ApiProperty()
    log_id: string;

    @ApiProperty()
    strategy: string;

    @ApiProperty()
    strategy_type: string;

    @ApiProperty()
    description: string;
}

class Auth0Event {
    @ApiProperty()
    type: string;

    @ApiProperty()
    data: Auth0EventData;
}

@Controller('/identity-event')
@ApiTags('identity')
export class IdentityEventController {

    @Post('/')
    @ApiOperation({ summary: 'Insert identity event' })
    async insertIdentityEvent(@Body() auth0Event: Auth0Event) {

        if (auth0Event.type !== 'com.auth0.Log') {
            console.log(`Ignoring event type ${auth0Event.type}`);
            return;
        }

        const entityManager = getManager();

        const auth0EventData = auth0Event.data;

        const identityEvent = {
            time: auth0EventData.date,
            source: EVENT_SOURCE,
            type: auth0EventData.type,
            connection: auth0EventData.connection,
            connection_id: auth0EventData.connection_id,
            client_id: auth0EventData.client_id,
            client_name: auth0EventData.client_name,
            ip: auth0EventData.ip,
            user_agent: auth0EventData.user_agent,
            hostname: auth0EventData.hostname,
            user_id: auth0EventData.user_id,
            user_name: auth0EventData.user_name,
            log_id: auth0EventData.log_id,
            strategy: auth0EventData.strategy,
            strategy_type: auth0EventData.strategy_type,
            description: auth0EventData.description
        };

        await entityManager
            .createQueryBuilder()
            .insert()
            .into('denim.identity_event')
            .values(identityEvent)
            .execute();

        console.log('Inserted identity event to the database');
    }
}