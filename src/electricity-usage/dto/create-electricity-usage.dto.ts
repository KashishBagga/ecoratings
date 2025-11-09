import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateElectricityUsageDto {
  @IsNotEmpty()
  facilityId: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsNotEmpty()
  year: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;

  @ApiProperty({ example: 15000.5 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  consumptionKwh: number;
}

