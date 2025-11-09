import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmissionFactor } from './entities/emission-factor.entity';
import { CreateEmissionFactorDto } from './dto/create-emission-factor.dto';
import { UpdateEmissionFactorDto } from './dto/update-emission-factor.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmissionFactorsService {
  private readonly factorsFilePath = path.join(process.cwd(), 'data', 'emission-factors.json');

  constructor(
    @InjectRepository(EmissionFactor)
    private emissionFactorRepository: Repository<EmissionFactor>,
  ) {
    // Initialize from JSON asynchronously (fire and forget)
    this.initializeFromJson().catch((error) => {
      console.warn('Failed to initialize emission factors from JSON:', error);
    });
  }

  async create(createEmissionFactorDto: CreateEmissionFactorDto): Promise<EmissionFactor> {
    // Check for duplicate region/year
    const existing = await this.emissionFactorRepository.findOne({
      where: {
        region: createEmissionFactorDto.region,
        year: createEmissionFactorDto.year,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Emission factor already exists for region ${createEmissionFactorDto.region} and year ${createEmissionFactorDto.year}`,
      );
    }

    const factor = this.emissionFactorRepository.create(createEmissionFactorDto);
    return await this.emissionFactorRepository.save(factor);
  }

  async findAll(region?: string, year?: number): Promise<EmissionFactor[]> {
    const where: any = {};
    if (region) where.region = region;
    if (year) where.year = year;
    where.isActive = true;

    return await this.emissionFactorRepository.find({
      where,
      order: { year: 'DESC', region: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EmissionFactor> {
    const factor = await this.emissionFactorRepository.findOne({
      where: { id },
    });

    if (!factor) {
      throw new NotFoundException(`Emission factor with ID ${id} not found`);
    }

    return factor;
  }

  async findByRegionAndYear(region: string, year: number): Promise<EmissionFactor | null> {
    return await this.emissionFactorRepository.findOne({
      where: {
        region,
        year,
        isActive: true,
      },
    });
  }

  async update(id: string, updateEmissionFactorDto: UpdateEmissionFactorDto): Promise<EmissionFactor> {
    const factor = await this.findOne(id);
    Object.assign(factor, updateEmissionFactorDto);
    return await this.emissionFactorRepository.save(factor);
  }

  async remove(id: string): Promise<void> {
    const factor = await this.findOne(id);
    // Soft delete by setting isActive to false
    factor.isActive = false;
    await this.emissionFactorRepository.save(factor);
  }

  private async initializeFromJson(): Promise<void> {
    try {
      if (fs.existsSync(this.factorsFilePath)) {
        const jsonData = JSON.parse(fs.readFileSync(this.factorsFilePath, 'utf8'));
        const factors = Array.isArray(jsonData) ? jsonData : jsonData.factors || [];

        for (const factorData of factors) {
          const existing = await this.emissionFactorRepository.findOne({
            where: {
              region: factorData.region,
              year: factorData.year,
            },
          });

          if (!existing) {
            const factor = this.emissionFactorRepository.create({
              region: factorData.region,
              year: factorData.year,
              factorKgCo2PerKwh: factorData.factorKgCo2PerKwh,
              source: factorData.source || 'JSON Import',
              notes: factorData.notes || null,
              isActive: true,
            });
            await this.emissionFactorRepository.save(factor);
          }
        }
      }
    } catch (error) {
      console.warn('Could not initialize emission factors from JSON:', error.message);
    }
  }
}

