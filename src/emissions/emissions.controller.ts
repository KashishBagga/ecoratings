import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EmissionsService } from './emissions.service';

@ApiTags('emissions')
@Controller('emissions')
export class EmissionsController {
  constructor(private readonly emissionsService: EmissionsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get emissions summary and reports' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Filter by organization ID' })
  @ApiQuery({ name: 'facilityId', required: false, description: 'Filter by facility ID' })
  @ApiQuery({ name: 'year', required: false, description: 'Filter by year' })
  @ApiResponse({ status: 200, description: 'Emissions summary' })
  getSummary(
    @Query('organizationId') organizationId?: string,
    @Query('facilityId') facilityId?: string,
    @Query('year') year?: number,
  ) {
    return this.emissionsService.getSummary(
      organizationId,
      facilityId,
      year ? parseInt(year.toString()) : undefined,
    );
  }
}

