import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsModule } from './organizations/organizations.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { ElectricityUsageModule } from './electricity-usage/electricity-usage.module';
import { EmissionFactorsModule } from './emission-factors/emission-factors.module';
import { EmissionsModule } from './emissions/emissions.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'postgres'),
        database: configService.get('DATABASE_NAME', 'ecoratings'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('LOG_LEVEL') === 'DEBUG',
      }),
      inject: [ConfigService],
    }),
    OrganizationsModule,
    FacilitiesModule,
    ElectricityUsageModule,
    EmissionFactorsModule,
    EmissionsModule,
    HealthModule,
  ],
})
export class AppModule {}

