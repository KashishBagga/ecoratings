import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElectricityUsage } from '../electricity-usage/entities/electricity-usage.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Facility } from '../facilities/entities/facility.entity';
import { EmissionFactor } from '../emission-factors/entities/emission-factor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ElectricityUsage, Organization, Facility, EmissionFactor]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}

