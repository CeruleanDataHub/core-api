import { Controller, Get, Post, NotFoundException, BadRequestException, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Registry } from 'azure-iothub';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('/')
    getBase(): string {
        return this.appService.getBaseApi();
    }

    @Get('/api')
    getBaseAPI(): string {
        return this.appService.getBaseApi();
    }

    /*
        {
            id: TWIN_ID,
            state: {
                properties: {
                    desired: {
                        powerLevel: 9000
                    }
                }
            }
        }
    */
    @Post('/api/twin/update')
    async postUpdateTwin(
        @Body() postTwin: any, //TODO object type
    ): Promise<any> {
        var registry = Registry.fromConnectionString(
            process.env.IOTHUB_SERVICE_CONNECTION,
        );
        registry.getTwin(postTwin.id, async (err, twin) => {
            if (err) {
                console.log("error updating twin:", err);
                throw new NotFoundException();
            } else {
                twin.update(postTwin.state, (err, twin) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("Sent patch:");
                        console.log(JSON.stringify(postTwin.state, null, 2));
                    }
                });
            }
        });
    }

    @Get('/api/twin/:id')
    async getTwin(
        @Param() params
    ): Promise<any> {
        var registry = Registry.fromConnectionString(
            process.env.IOTHUB_SERVICE_CONNECTION,
        );
        try {
            const twin = await registry.getTwin(params.id);
            return twin.responseBody;
        } catch (error) {
            if (error.responseBody.includes("DeviceNotFound")){
                return new NotFoundException();
            } else {
                return new BadRequestException();
            }
        }
    }
}
