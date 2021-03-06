import {
    Controller,
    Get,
    Post,
    NotFoundException,
    BadRequestException,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Registry } from 'azure-iothub';
import { ApiOperation, ApiTags, ApiParam, ApiResponse, ApiProperty } from '@nestjs/swagger';

class DesiredProperties {
    @ApiProperty()
    desired: object;
}

class TwinState {
    @ApiProperty()
    properties: DesiredProperties;
}

class UpdateTwinDto {
    @ApiProperty()
    id: string;
    @ApiProperty()
    state: TwinState;
}

@Controller()
export class TwinController {

    @Post('/twin/update')
    @ApiOperation({ summary: 'Update device twin desired properties' })
    @ApiTags('device twin')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: 200, description: 'Success'})
    @ApiResponse({ status: 404, description: 'Device not found' })
    async postUpdateTwin(
        @Body() postTwin: UpdateTwinDto,
    ): Promise<void> {
        const registry = Registry.fromConnectionString(
            process.env.IOTHUB_SERVICE_CONNECTION,
        );

        return new Promise<void>((resolve, reject) => {
            registry.getTwin(postTwin.id, (err, twin) => {
                if (err) {
                    console.error('error updating twin', err.name);
                    if (err.name === "DeviceNotFoundError") {
                        reject(new NotFoundException());
                    } else {
                        reject(err);
                    }
                } else {
                    return twin.update(postTwin.state, (err) => {
                        if (err) {
                            console.error(err.name);
                            reject(err);
                        } else {
                            console.log('Sent patch:');
                            console.log(JSON.stringify(postTwin.state, null, 2));
                            resolve();
                        }
                    });
                }
            });
        });
    }

    @Get('/twin/:id')
    @ApiOperation({ summary: 'Get device twin' })
    @ApiTags('device twin')
    @ApiParam({ name: 'id', description: 'External ID of the device (device ID / registration ID in Azure IoT Hub)' })
    @ApiResponse({ status: 200, description: 'Success'})
    @ApiResponse({ status: 404, description: 'Device not found' })
    async getTwin(@Param('id') id: string): Promise<any> {
        const registry = Registry.fromConnectionString(
            process.env.IOTHUB_SERVICE_CONNECTION,
        );
        try {
            const twin = await registry.getTwin(id);
            return twin.responseBody;
        } catch (error) {
            if (error.responseBody.includes('DeviceNotFound')) {
                throw new NotFoundException();
            } else {
                throw new BadRequestException();
            }
        }
    }
}
