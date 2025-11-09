import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ElectricityUsageService } from './electricity-usage.service';
import { CreateElectricityUsageDto } from './dto/create-electricity-usage.dto';
import { BulkUploadElectricityUsageDto } from './dto/bulk-upload-electricity-usage.dto';

@ApiTags('electricity-usage')
@Controller('electricity-usage')
export class ElectricityUsageController {
  constructor(private readonly electricityUsageService: ElectricityUsageService) {}

  @Post()
  @ApiOperation({ summary: 'Upload monthly electricity usage data' })
  @ApiResponse({ status: 201, description: 'Electricity usage created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or validation error' })
  @ApiResponse({ status: 409, description: 'Duplicate entry' })
  create(@Body() createElectricityUsageDto: CreateElectricityUsageDto) {
    return this.electricityUsageService.create(createElectricityUsageDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk upload electricity usage data' })
  @ApiResponse({ status: 201, description: 'Bulk upload completed' })
  bulkUpload(@Body() bulkUploadDto: BulkUploadElectricityUsageDto) {
    return this.electricityUsageService.bulkUpload(bulkUploadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all electricity usage records' })
  @ApiQuery({ name: 'facilityId', required: false, description: 'Filter by facility ID' })
  @ApiQuery({ name: 'year', required: false, description: 'Filter by year' })
  @ApiResponse({ status: 200, description: 'List of electricity usage records' })
  findAll(@Query('facilityId') facilityId?: string, @Query('year') year?: number) {
    return this.electricityUsageService.findAll(facilityId, year ? parseInt(year.toString()) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get electricity usage by ID' })
  @ApiResponse({ status: 200, description: 'Electricity usage details' })
  @ApiResponse({ status: 404, description: 'Electricity usage not found' })
  findOne(@Param('id') id: string) {
    return this.electricityUsageService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete electricity usage record' })
  @ApiResponse({ status: 204, description: 'Record deleted' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  remove(@Param('id') id: string) {
    return this.electricityUsageService.remove(id);
  }

  @Patch('recalculate')
  @ApiOperation({ summary: 'Recalculate emissions for existing usage records' })
  @ApiQuery({ name: 'facilityId', required: false, description: 'Filter by facility ID' })
  @ApiQuery({ name: 'year', required: false, description: 'Filter by year' })
  @ApiResponse({ status: 200, description: 'Emissions recalculated' })
  recalculateEmissions(
    @Query('facilityId') facilityId?: string,
    @Query('year') year?: number,
  ) {
    return this.electricityUsageService.recalculateEmissions(
      facilityId,
      year ? parseInt(year.toString()) : undefined,
    );
  }
}

