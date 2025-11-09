import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectricityUsageService } from './electricity-usage.service';
import { ElectricityUsageController } from './electricity-usage.controller';
import { ElectricityUsage } from './entities/electricity-usage.entity';
import { FacilitiesModule } from '../facilities/facilities.module';
import { EmissionFactorsModule } from '../emission-factors/emission-factors.module';
import { EmissionsModule } from '../emissions/emissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ElectricityUsage]),
    FacilitiesModule,
    EmissionFactorsModule,
    EmissionsModule,
  ],
  controllers: [ElectricityUsageController],
  providers: [ElectricityUsageService],
  exports: [ElectricityUsageService],
})
export class ElectricityUsageModule {}

