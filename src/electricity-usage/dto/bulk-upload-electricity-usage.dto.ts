import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateElectricityUsageDto } from './create-electricity-usage.dto';

export class BulkUploadElectricityUsageDto {
  @ApiProperty({
    type: [CreateElectricityUsageDto],
    description: 'Array of electricity usage records',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateElectricityUsageDto)
  data: CreateElectricityUsageDto[];

  @ApiProperty({
    required: false,
    description: 'Optional upload ID for idempotency',
  })
  @IsOptional()
  @IsUUID()
  uploadId?: string;
}

