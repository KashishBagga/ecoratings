import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElectricityUsage } from '../electricity-usage/entities/electricity-usage.entity';
import { EmissionFactorsService } from '../emission-factors/emission-factors.service';
import { FacilitiesService } from '../facilities/facilities.service';

@Injectable()
export class EmissionsService {
  constructor(
    @InjectRepository(ElectricityUsage)
    private electricityUsageRepository: Repository<ElectricityUsage>,
    private emissionFactorsService: EmissionFactorsService,
    private facilitiesService: FacilitiesService,
  ) {}

  async calculateEmissionsForUsage(usageId: string): Promise<ElectricityUsage> {
    const usage = await this.electricityUsageRepository.findOne({
      where: { id: usageId },
      relations: ['facility'],
    });

    if (!usage) {
      throw new NotFoundException(`Electricity usage with ID ${usageId} not found`);
    }

    const facility = await this.facilitiesService.findOne(usage.facilityId);
    const emissionFactor = await this.emissionFactorsService.findByRegionAndYear(
      facility.region,
      usage.year,
    );

    if (!emissionFactor) {
      // Try to find the most recent factor for the region
      const factors = await this.emissionFactorsService.findAll(facility.region);
      if (factors.length === 0) {
        throw new NotFoundException(
          `No emission factor found for region ${facility.region} and year ${usage.year}`,
        );
      }
      // Use the most recent factor
      const mostRecentFactor = factors[0];
      usage.calculatedEmissions =
        Number(usage.consumptionKwh) * Number(mostRecentFactor.factorKgCo2PerKwh);
      usage.emissionFactorUsed = `${mostRecentFactor.region}-${mostRecentFactor.year}`;
    } else {
      usage.calculatedEmissions =
        Number(usage.consumptionKwh) * Number(emissionFactor.factorKgCo2PerKwh);
      usage.emissionFactorUsed = `${emissionFactor.region}-${emissionFactor.year}`;
    }

    return await this.electricityUsageRepository.save(usage);
  }

  async getSummary(organizationId?: string, facilityId?: string, year?: number): Promise<any> {
    const queryBuilder = this.electricityUsageRepository
      .createQueryBuilder('usage')
      .leftJoinAndSelect('usage.facility', 'facility')
      .leftJoinAndSelect('facility.organization', 'organization');

    if (organizationId) {
      queryBuilder.where('organization.id = :organizationId', { organizationId });
    }

    if (facilityId) {
      if (organizationId) {
        queryBuilder.andWhere('facility.id = :facilityId', { facilityId });
      } else {
        queryBuilder.where('facility.id = :facilityId', { facilityId });
      }
    }

    if (year) {
      queryBuilder.andWhere('usage.year = :year', { year });
    }

    const usages = await queryBuilder.getMany();

    const totalConsumption = usages.reduce(
      (sum, u) => sum + Number(u.consumptionKwh),
      0,
    );
    const totalEmissions = usages.reduce(
      (sum, u) => sum + (Number(u.calculatedEmissions) || 0),
      0,
    );
    const facilitiesCount = new Set(usages.map((u) => u.facilityId)).size;
    const anomaliesCount = usages.filter((u) => u.hasAnomaly).length;

    // Group by facility
    const byFacility = usages.reduce((acc, usage) => {
      const facilityId = usage.facilityId;
      if (!acc[facilityId]) {
        acc[facilityId] = {
          facilityId,
          facilityName: usage.facility.name,
          totalConsumption: 0,
          totalEmissions: 0,
          recordsCount: 0,
        };
      }
      acc[facilityId].totalConsumption += Number(usage.consumptionKwh);
      acc[facilityId].totalEmissions += Number(usage.calculatedEmissions) || 0;
      acc[facilityId].recordsCount += 1;
      return acc;
    }, {} as any);

    // Group by month
    const byMonth = usages.reduce((acc, usage) => {
      const key = `${usage.year}-${usage.month.toString().padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = {
          period: key,
          totalConsumption: 0,
          totalEmissions: 0,
          recordsCount: 0,
        };
      }
      acc[key].totalConsumption += Number(usage.consumptionKwh);
      acc[key].totalEmissions += Number(usage.calculatedEmissions) || 0;
      acc[key].recordsCount += 1;
      return acc;
    }, {} as any);

    return {
      summary: {
        totalConsumption: Number(totalConsumption.toFixed(2)),
        totalEmissions: Number(totalEmissions.toFixed(2)),
        facilitiesCount,
        recordsCount: usages.length,
        anomaliesCount,
        averageEmissionsPerKwh:
          totalConsumption > 0 ? Number((totalEmissions / totalConsumption).toFixed(6)) : 0,
      },
      byFacility: Object.values(byFacility),
      byMonth: Object.values(byMonth),
    };
  }
}

