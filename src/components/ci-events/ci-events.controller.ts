import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import axios from 'axios';

@Controller('/cloud-ci-events')
@ApiTags('Continous Integration Events')
export class CiEventsController {
    @Post('/')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cloud CI events' })
    async cloudCiEvents(@Body() body: any) {
        let color = 'green';
        let value = 'success';
        if (body.type === 'network.cdh.cloud-ci-failure') {
            color = 'red';
            value = 'failure';
        } else if (body.type === 'network.cdh.cloud-ci-skipped') {
            color = 'yellow';
            value = 'skipped';
        }
        const flowdockData = {
            flow_token: process.env.FLOW_TOKEN,
            event: 'activity',
            author: {
                name: 'Cerulean Data Hub Builder',
                avatar:
                    'https://avatars2.githubusercontent.com/u/66473630?s=60&v=4',
            },
            title: body.data.name,
            external_thread_id: body.id,
            thread: {
                title: body.data.name,
                body: body.data.name,
                external_url: `https://${body.source}`,
                status: {
                    color,
                    value,
                },
            },
        };

        console.log('Cloud-ci-events:', body);

        try {
            await axios({
                method: 'post',
                url: 'https://api.flowdock.com/messages',
                data: flowdockData,
            });
            return;
        } catch (err) {
            return console.error(err);
        }
    }
}
