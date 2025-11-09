import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facility } from './entities/facility.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
    private organizationsService: OrganizationsService,
  ) {}

  async create(createFacilityDto: CreateFacilityDto): Promise<Facility> {
    // Verify organization exists
    await this.organizationsService.findOne(createFacilityDto.organizationId);

    const facility = this.facilityRepository.create(createFacilityDto);
    return await this.facilityRepository.save(facility);
  }

  async findAll(organizationId?: string): Promise<Facility[]> {
    const where = organizationId ? { organizationId } : {};
    return await this.facilityRepository.find({
      where,
      relations: ['organization', 'electricityUsage'],
    });
  }

  async findOne(id: string): Promise<Facility> {
    const facility = await this.facilityRepository.findOne({
      where: { id },
      relations: ['organization', 'electricityUsage'],
    });

    if (!facility) {
      throw new NotFoundException(`Facility with ID ${id} not found`);
    }

    return facility;
  }

  async update(id: string, updateFacilityDto: UpdateFacilityDto): Promise<Facility> {
    const facility = await this.findOne(id);
    
    if (updateFacilityDto.organizationId && updateFacilityDto.organizationId !== facility.organizationId) {
      await this.organizationsService.findOne(updateFacilityDto.organizationId);
    }

    Object.assign(facility, updateFacilityDto);
    return await this.facilityRepository.save(facility);
  }

  async remove(id: string): Promise<void> {
    const facility = await this.findOne(id);
    await this.facilityRepository.remove(facility);
  }
}

