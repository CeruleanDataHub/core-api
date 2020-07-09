import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/health')
@ApiTags('health')
export class HealthController {

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Get app health status' })
  health() {
    return;
  }
}
