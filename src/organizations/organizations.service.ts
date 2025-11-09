import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    try {
        const name = createOrganizationDto.name.replace(/\s+/g, '').toLowerCase();
        const existingOrganization = await this.organizationRepository.findOne({
            where: { name },
        });
        if (existingOrganization) {
            return existingOrganization;
        }
        const organization = this.organizationRepository.create({ ...createOrganizationDto, name });
        return await this.organizationRepository.save(organization);
    } catch (error) {
        throw new BadRequestException(error.message);
    }
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find({
      relations: ['facilities'],
    });
  }

  async findOne(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['facilities'],
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findOne(id);
    Object.assign(organization, updateOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }
}

