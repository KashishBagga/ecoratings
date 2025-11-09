import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ElectricityUsage } from './entities/electricity-usage.entity';
import { CreateElectricityUsageDto } from './dto/create-electricity-usage.dto';
import { BulkUploadElectricityUsageDto } from './dto/bulk-upload-electricity-usage.dto';
import { FacilitiesService } from '../facilities/facilities.service';
import { EmissionFactorsService } from '../emission-factors/emission-factors.service';
import { EmissionsService } from '../emissions/emissions.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ElectricityUsageService {
  constructor(
    @InjectRepository(ElectricityUsage)
    private electricityUsageRepository: Repository<ElectricityUsage>,
    private facilitiesService: FacilitiesService,
    private emissionFactorsService: EmissionFactorsService,
    private emissionsService: EmissionsService,
  ) {}

  async create(
    createElectricityUsageDto: CreateElectricityUsageDto,
    uploadId?: string,
  ): Promise<ElectricityUsage> {
    // Verify facility exists
    const facility = await this.facilitiesService.findOne(createElectricityUsageDto.facilityId);

    // Check for duplicate (idempotency)
    if (uploadId) {
      const existing = await this.electricityUsageRepository.findOne({
        where: { uploadId },
      });
      if (existing) {
        return existing;
      }
    }

    // Check for duplicate month/year for facility
    const existingUsage = await this.electricityUsageRepository.findOne({
      where: {
        facilityId: createElectricityUsageDto.facilityId,
        year: createElectricityUsageDto.year,
        month: createElectricityUsageDto.month,
      },
    });

    if (existingUsage) {
      throw new ConflictException(
        `Electricity usage already exists for facility ${createElectricityUsageDto.facilityId} for ${createElectricityUsageDto.year}-${createElectricityUsageDto.month}`,
      );
    }

    // Validate month
    if (createElectricityUsageDto.month < 1 || createElectricityUsageDto.month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }

    // Validate consumption
    if (createElectricityUsageDto.consumptionKwh < 0) {
      throw new BadRequestException('Consumption cannot be negative');
    }

    // Detect anomalies
    const anomalyCheck = await this.detectAnomalies(
      createElectricityUsageDto.facilityId,
      createElectricityUsageDto.year,
      createElectricityUsageDto.month,
      createElectricityUsageDto.consumptionKwh,
    );

    const usage = this.electricityUsageRepository.create({
      ...createElectricityUsageDto,
      uploadId: uploadId || uuidv4(),
      hasAnomaly: anomalyCheck.hasAnomaly,
      anomalyReason: anomalyCheck.reason,
    });

    const savedUsage = await this.electricityUsageRepository.save(usage);

    // Calculate emissions
    await this.emissionsService.calculateEmissionsForUsage(savedUsage.id);

    return await this.findOne(savedUsage.id);
  }

  async bulkUpload(
    bulkUploadDto: BulkUploadElectricityUsageDto,
  ): Promise<{ created: number; skipped: number; errors: any[] }> {
    const uploadId = bulkUploadDto.uploadId || uuidv4();
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as any[],
    };

    for (const usageData of bulkUploadDto.data) {
      try {
        await this.create(usageData, uploadId);
        results.created++;
      } catch (error) {
        if (error instanceof ConflictException) {
          results.skipped++;
        } else {
          results.errors.push({
            data: usageData,
            error: error.message,
          });
        }
      }
    }

    return results;
  }

  async findAll(facilityId?: string, year?: number): Promise<ElectricityUsage[]> {
    const where: any = {};
    if (facilityId) where.facilityId = facilityId;
    if (year) where.year = year;

    return await this.electricityUsageRepository.find({
      where,
      relations: ['facility'],
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ElectricityUsage> {
    const usage = await this.electricityUsageRepository.findOne({
      where: { id },
      relations: ['facility'],
    });

    if (!usage) {
      throw new NotFoundException(`Electricity usage with ID ${id} not found`);
    }

    return usage;
  }

  async remove(id: string): Promise<void> {
    const usage = await this.findOne(id);
    await this.electricityUsageRepository.remove(usage);
  }

  private async detectAnomalies(
    facilityId: string,
    year: number,
    month: number,
    consumptionKwh: number,
  ): Promise<{ hasAnomaly: boolean; reason: string | null }> {
    const reasons: string[] = [];

    // Check for zero or negative consumption
    if (consumptionKwh <= 0) {
      reasons.push('Zero or negative consumption detected');
    }

    // Check for abnormally high consumption (spike detection)
    const historicalData = await this.electricityUsageRepository.find({
      where: { facilityId },
      order: { year: 'DESC', month: 'DESC' },
      take: 12, // Last 12 months
    });

    if (historicalData.length > 0) {
      const avgConsumption =
        historicalData.reduce((sum, d) => sum + Number(d.consumptionKwh), 0) /
        historicalData.length;
      const threshold = avgConsumption * 2; // 200% of average

      if (consumptionKwh > threshold) {
        reasons.push(
          `Consumption (${consumptionKwh} kWh) is more than 200% of historical average (${avgConsumption.toFixed(2)} kWh)`,
        );
      }
    }

    // Check for missing consecutive months
    const previousMonth = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
    const previousUsage = await this.electricityUsageRepository.findOne({
      where: {
        facilityId,
        year: previousMonth.year,
        month: previousMonth.month,
      },
    });

    if (!previousUsage && historicalData.length > 0) {
      reasons.push(`Missing data for previous month (${previousMonth.year}-${previousMonth.month})`);
    }

    return {
      hasAnomaly: reasons.length > 0,
      reason: reasons.length > 0 ? reasons.join('; ') : null,
    };
  }

  async recalculateEmissions(facilityId?: string, year?: number): Promise<number> {
    const where: any = {};
    if (facilityId) where.facilityId = facilityId;
    if (year) where.year = year;

    const usages = await this.electricityUsageRepository.find({ where });
    let recalculated = 0;

    for (const usage of usages) {
      await this.emissionsService.calculateEmissionsForUsage(usage.id);
      recalculated++;
    }

    return recalculated;
  }
}

