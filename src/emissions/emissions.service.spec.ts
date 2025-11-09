import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmissionsService } from './emissions.service';
import { EmissionFactorsService } from '../emission-factors/emission-factors.service';
import { FacilitiesService } from '../facilities/facilities.service';
import { ElectricityUsage } from '../electricity-usage/entities/electricity-usage.entity';

describe('EmissionsService', () => {
  let service: EmissionsService;
  let usageRepository: Repository<ElectricityUsage>;
  let emissionFactorsService: EmissionFactorsService;
  let facilitiesService: FacilitiesService;

  const mockUsageRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEmissionFactorsService = {
    findByRegionAndYear: jest.fn(),
    findAll: jest.fn(),
  };

  const mockFacilitiesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmissionsService,
        {
          provide: getRepositoryToken(ElectricityUsage),
          useValue: mockUsageRepository,
        },
        {
          provide: EmissionFactorsService,
          useValue: mockEmissionFactorsService,
        },
        {
          provide: FacilitiesService,
          useValue: mockFacilitiesService,
        },
      ],
    }).compile();

    service = module.get<EmissionsService>(EmissionsService);
    usageRepository = module.get<Repository<ElectricityUsage>>(
      getRepositoryToken(ElectricityUsage),
    );
    emissionFactorsService = module.get<EmissionFactorsService>(EmissionFactorsService);
    facilitiesService = module.get<FacilitiesService>(FacilitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateEmissionsForUsage', () => {
    it('should calculate emissions using emission factor', async () => {
      const facility = { id: 'facility-1', region: 'North America' };
      const usage = {
        id: 'usage-1',
        facilityId: 'facility-1',
        year: 2024,
        consumptionKwh: 1000,
        calculatedEmissions: null,
        emissionFactorUsed: null,
      };
      const emissionFactor = {
        id: 'factor-1',
        region: 'North America',
        year: 2024,
        factorKgCo2PerKwh: 0.389,
      };

      mockUsageRepository.findOne.mockResolvedValue(usage);
      mockFacilitiesService.findOne.mockResolvedValue(facility);
      mockEmissionFactorsService.findByRegionAndYear.mockResolvedValue(emissionFactor);
      mockUsageRepository.save.mockResolvedValue({
        ...usage,
        calculatedEmissions: 389,
        emissionFactorUsed: 'North America-2024',
      });

      const result = await service.calculateEmissionsForUsage('usage-1');

      expect(result.calculatedEmissions).toBe(389);
      expect(result.emissionFactorUsed).toBe('North America-2024');
    });
  });
});

