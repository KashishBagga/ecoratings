import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElectricityUsage } from '../electricity-usage/entities/electricity-usage.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Facility } from '../facilities/entities/facility.entity';
import { EmissionFactor } from '../emission-factors/entities/emission-factor.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(ElectricityUsage)
    private electricityUsageRepository: Repository<ElectricityUsage>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
    @InjectRepository(EmissionFactor)
    private emissionFactorRepository: Repository<EmissionFactor>,
  ) {}

  async check(): Promise<{ status: string; timestamp: string }> {
    // Simple health check - verify database connection
    try {
      await this.organizationRepository.count();
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getMetrics(): Promise<any> {
    const [
      organizationsCount,
      facilitiesCount,
      usageRecordsCount,
      emissionFactorsCount,
    ] = await Promise.all([
      this.organizationRepository.count(),
      this.facilityRepository.count(),
      this.electricityUsageRepository.count(),
      this.emissionFactorRepository.count({ where: { isActive: true } }),
    ]);

    const totalEmissions = await this.electricityUsageRepository
      .createQueryBuilder('usage')
      .select('SUM(usage.calculatedEmissions)', 'total')
      .getRawOne();

    const anomaliesCount = await this.electricityUsageRepository.count({
      where: { hasAnomaly: true },
    });

    return {
      timestamp: new Date().toISOString(),
      counts: {
        organizations: organizationsCount,
        facilities: facilitiesCount,
        electricityUsageRecords: usageRecordsCount,
        emissionFactors: emissionFactorsCount,
        anomalies: anomaliesCount,
      },
      totals: {
        totalEmissionsKgCo2: totalEmissions?.total || 0,
      },
    };
  }
}

