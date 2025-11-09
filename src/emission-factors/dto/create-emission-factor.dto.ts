import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateEmissionFactorDto {
  @ApiProperty({ example: 'North America' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  @IsNotEmpty()
  year: number;

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  factorKgCo2PerKwh: number;

  @ApiProperty({ example: 'EPA Grid Factors 2024', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: 'Updated based on latest grid mix', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

