import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationsService } from './organizations.service';
import { Organization } from './entities/organization.entity';
import { NotFoundException } from '@nestjs/common';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let repository: Repository<Organization>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: getRepositoryToken(Organization),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    repository = module.get<Repository<Organization>>(getRepositoryToken(Organization));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an organization', async () => {
      const createDto = { name: 'Test Org', description: 'Test Description' };
      const transformedName = 'testorg';
      const organizationData = { ...createDto, name: transformedName };
      const organization = { id: '1', ...organizationData } as Organization;

      mockRepository.findOne.mockResolvedValue(null); // No existing organization
      mockRepository.create.mockReturnValue(organization);
      mockRepository.save.mockResolvedValue(organization);

      const result = await service.create(createDto);

      expect(result).toEqual(organization);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: transformedName },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(organizationData);
      expect(mockRepository.save).toHaveBeenCalledWith(organization);
    });

    it('should return existing organization if name already exists', async () => {
      const createDto = { name: 'Test Org', description: 'Test Description' };
      const transformedName = 'testorg';
      const existingOrganization = { id: '1', name: transformedName, description: 'Existing' } as Organization;

      mockRepository.findOne.mockResolvedValue(existingOrganization);

      const result = await service.create(createDto);

      expect(result).toEqual(existingOrganization);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { name: transformedName },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an organization', async () => {
      const organization = { id: '1', name: 'Test Org' } as Organization;
      mockRepository.findOne.mockResolvedValue(organization);

      const result = await service.findOne('1');

      expect(result).toEqual(organization);
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});

