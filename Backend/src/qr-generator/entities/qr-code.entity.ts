import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QrScanEntity } from './qr-scan.entity';

export type QrCodeMode = 'static' | 'dynamic';
export type QrContentType = 'url' | 'text';

@Entity('qr_codes')
export class QrCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'short_code', type: 'varchar', length: 16, nullable: true })
  shortCode!: string | null;

  @Column({ type: 'varchar', length: 16 })
  mode!: QrCodeMode;

  @Column({ name: 'content_type', type: 'varchar', length: 16 })
  contentType!: QrContentType;

  @Column({ type: 'text' })
  payload!: string;

  @Column({ name: 'encoded_data', type: 'text' })
  encodedData!: string;

  @Column({ name: 'foreground_color', type: 'varchar', length: 16, default: '#000000' })
  foregroundColor!: string;

  @Column({ name: 'background_color', type: 'varchar', length: 16, default: '#ffffff' })
  backgroundColor!: string;

  @Column({ name: 'error_correction', type: 'varchar', length: 2, default: 'H' })
  errorCorrection!: string;

  @Column({ name: 'size_px', type: 'int', default: 512 })
  sizePx!: number;

  @Column({ name: 'has_logo', type: 'boolean', default: false })
  hasLogo!: boolean;

  @Column({ name: 'logo_scale', type: 'float', default: 0.22 })
  logoScale!: number;

  @Column({ name: 'scan_count', type: 'int', default: 0 })
  scanCount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @OneToMany(() => QrScanEntity, (scan) => scan.qrCode)
  scans!: QrScanEntity[];
}
