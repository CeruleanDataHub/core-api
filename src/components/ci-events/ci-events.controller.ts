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
        const title = `${body.data.name} for ${body.data.image_name}`;
        const commitInfo = `<a href="https://${body.data.source}/commit/${
            body.data.commit
        }">${body.data.commit.substring(0, 8)}</a>`;
        const eventInfo = `<a href="${body.data.event_path}">action</a>`;
        const dockerHubLink = `Docker Hub: <a href="https://https://hub.docker.com/r/${body.data.image_name}">${body.data.image_name}</a>`;
        const content = `${body.data.name} for build ${eventInfo} for commit ${commitInfo}<br />${dockerHubLink}`;
        const flowdockData = {
            flow_token: process.env.FLOW_TOKEN,
            event: 'activity',
            author: {
                name: body.data.actor,
                avatar: `https://github.com/${body.data.actor}.png`,
            },
            title: body.data.name,
            external_thread_id: body.id,
            thread: {
                title,
                body: content,
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
