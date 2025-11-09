import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmissionsService } from './emissions.service';
import { EmissionsController } from './emissions.controller';
import { ElectricityUsage } from '../electricity-usage/entities/electricity-usage.entity';
import { EmissionFactorsModule } from '../emission-factors/emission-factors.module';
import { FacilitiesModule } from '../facilities/facilities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ElectricityUsage]),
    EmissionFactorsModule,
    FacilitiesModule,
  ],
  controllers: [EmissionsController],
  providers: [EmissionsService],
  exports: [EmissionsService],
})
export class EmissionsModule {}

