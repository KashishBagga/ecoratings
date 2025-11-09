import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Facility } from '../../facilities/entities/facility.entity';

@Entity('electricity_usage')
@Index(['facilityId', 'year', 'month'], { unique: true })
export class ElectricityUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Facility, (facility) => facility.electricityUsage)
  @JoinColumn({ name: 'facilityId' })
  facility: Facility;

  @Column()
  facilityId: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  consumptionKwh: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  calculatedEmissions: number;

  @Column({ type: 'varchar', nullable: true })
  emissionFactorUsed: string;

  @Column({ type: 'boolean', default: false })
  hasAnomaly: boolean;

  @Column({ type: 'text', nullable: true })
  anomalyReason: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  uploadId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

