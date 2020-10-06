import {
    Controller,
    Post,
    Body,
    Headers,
    Get,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import {
    ApiProperty,
    ApiOperation,
    ApiTags,
    ApiResponse,
} from '@nestjs/swagger';
import { getManager } from 'typeorm';
import { IdentityEventService } from './identity-event.service';
import util from "util";

class BaseEvent {
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

class IdentityEvent extends BaseEvent {
    @ApiProperty()
    source: string;

    @ApiProperty()
    time: Date;
}

class Auth0Event extends BaseEvent {
    @ApiProperty()
    date: Date;

    @ApiProperty()
    type: string;
}

class EventGridAuth0Event {
    @ApiProperty()
    type: string; // com.auth0.Log

    @ApiProperty()
    data: Auth0Event;
}

class RowOrder {
    @ApiProperty({ example: 'DESC' })
    time: 'ASC' | 'DESC';
}

export class AggregateActiveUserQuery {
    @ApiProperty({ required: false })
    startDate: Date;
    @ApiProperty({ required: false })
    endDate: Date;
    @ApiProperty({ required: false })
    order: RowOrder;
}

export class AggregateActiveUserRow {
    @ApiProperty()
    time: Date;
    @ApiProperty()
    activeUserCount: number;
}

export class AggregateActiveUsers {
    @ApiProperty()
    days: AggregateActiveUserRow[];
    @ApiProperty()
    total: number;
}

export class MaxUserLoginCountInADay {
    @ApiProperty()
    time: Date;
    @ApiProperty()
    count: number;
}

@Controller('/identity-event')
@ApiTags('identity')
export class IdentityEventController {
    constructor(private readonly identityEventService: IdentityEventService) {}

    @Get('/latest')
    @ApiOperation({ summary: 'Get the 100 latest identity events' })
    @ApiResponse({
        status: 200,
        type: IdentityEvent,
        isArray: true,
        description: 'Returns 100 identity events',
    })
    async getIdentityEvents(): Promise<IdentityEvent[]> {
        const entityManager = getManager();

        return await entityManager
            .createQueryBuilder()
            .select()
            .from('identity_event', '')
            .orderBy('time', 'DESC')
            .limit(100)
            .execute();
    }

    @Post('/')
    @ApiOperation({ summary: 'Insert identity event' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Identity event inserted',
    })
    async insertIdentityEvent(@Headers() headers, @Body() auth0Event: any) {
        if (auth0Event.type !== 'com.auth0.Log') {
            if(auth0Event && auth0Event.data && auth0Event.data.api === 'PutBlob'){
              this.identityEventService.parseIdentityEventFromBlob(auth0Event);
            } else {
              console.log(`Ignoring identity event type ${auth0Event.type}`);
            }
            return;
        }
        const auth0EventData = auth0Event.data;
        this.identityEventService.insertNewIdentityEvent(auth0EventData);
    }

    @Post('/user-activity')
    @ApiOperation({ summary: 'Query aggregate active users' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: AggregateActiveUsers,
        isArray: true,
        description: 'Returns aggregate active user data',
    })
    async queryUserActivity(
        @Body() query: AggregateActiveUserQuery,
    ): Promise<AggregateActiveUsers> {
        return await this.identityEventService.queryUserActivity(query);
    }

    @Get('/day-max-login-count')
    @ApiOperation({ summary: 'Get maximum user login count' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        type: MaxUserLoginCountInADay,
        description: 'Returns maximum user login count in a single day',
    })
    async getMaxUserLoginCountInADay(): Promise<MaxUserLoginCountInADay> {
        return await this.identityEventService.queryMaxUserLoginCountInADay();
    }
}
