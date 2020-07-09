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
        const dockerHubLink = `<a href="https://hub.docker.com/r/${body.data.image_name}">${body.data.version}</a>`;
        const commitInfo = `<a href="https://${body.data.source}/commit/${
            body.data.commit
        }">${body.data.commit.substring(0, 7)}</a>`;
        const threadTitle = `${body.data.name} for ${body.data.image_name}:${body.data.version}`;
        const eventTitle = `${commitInfo} pushed to ${dockerHubLink}`;
        const flowdockData = {
            flow_token: process.env.FLOW_TOKEN,
            event: 'activity',
            author: {
                name: body.data.actor,
                avatar: `https://github.com/${body.data.actor}.png`,
            },
            title: eventTitle,
            external_thread_id: body.id,
            thread: {
                title: threadTitle,
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
