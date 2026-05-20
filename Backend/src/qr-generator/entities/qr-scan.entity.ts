import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QrCodeEntity } from './qr-code.entity';

@Entity('qr_scans')
export class QrScanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'qr_code_id', type: 'uuid' })
  qrCodeId!: string;

  @ManyToOne(() => QrCodeEntity, (code) => code.scans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'qr_code_id' })
  qrCode!: QrCodeEntity;

  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent!: string | null;

  @Column({ name: 'ip_hash', type: 'varchar', length: 64, nullable: true })
  ipHash!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  referer!: string | null;

  @CreateDateColumn({ name: 'scanned_at', type: 'timestamptz' })
  scannedAt!: Date;
}
