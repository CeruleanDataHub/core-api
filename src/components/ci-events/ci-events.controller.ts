import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@Controller('/cloud-ci-events')
@ApiTags('Continous Integration Events')
export class CiEventsController {
    @Post('/')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cloud CI events' })
    cloudCiEvents(@Body() body: any): void {
        console.log('Cloud-ci-events:', body);
    }
}
