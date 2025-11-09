import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { EmissionFactorsService } from './emission-factors.service';
import { CreateEmissionFactorDto } from './dto/create-emission-factor.dto';
import { UpdateEmissionFactorDto } from './dto/update-emission-factor.dto';

@ApiTags('emission-factors')
@Controller('emission-factors')
export class EmissionFactorsController {
  constructor(private readonly emissionFactorsService: EmissionFactorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new emission factor' })
  @ApiResponse({ status: 201, description: 'Emission factor created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or duplicate' })
  create(@Body() createEmissionFactorDto: CreateEmissionFactorDto) {
    return this.emissionFactorsService.create(createEmissionFactorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all emission factors' })
  @ApiQuery({ name: 'region', required: false, description: 'Filter by region' })
  @ApiQuery({ name: 'year', required: false, description: 'Filter by year' })
  @ApiResponse({ status: 200, description: 'List of emission factors' })
  findAll(@Query('region') region?: string, @Query('year') year?: number) {
    return this.emissionFactorsService.findAll(region, year ? parseInt(year.toString()) : undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get emission factor by ID' })
  @ApiResponse({ status: 200, description: 'Emission factor details' })
  @ApiResponse({ status: 404, description: 'Emission factor not found' })
  findOne(@Param('id') id: string) {
    return this.emissionFactorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update emission factor' })
  @ApiResponse({ status: 200, description: 'Emission factor updated' })
  @ApiResponse({ status: 404, description: 'Emission factor not found' })
  update(@Param('id') id: string, @Body() updateEmissionFactorDto: UpdateEmissionFactorDto) {
    return this.emissionFactorsService.update(id, updateEmissionFactorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete emission factor (soft delete)' })
  @ApiResponse({ status: 204, description: 'Emission factor deleted' })
  @ApiResponse({ status: 404, description: 'Emission factor not found' })
  remove(@Param('id') id: string) {
    return this.emissionFactorsService.remove(id);
  }
}

