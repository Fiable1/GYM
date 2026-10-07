import { randomUUID } from 'crypto';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string = randomUUID();

  @Column({ type: 'varchar', length: 36, nullable: true })
  tenantId?: string;

  @CreateDateColumn({ type: Date })
  createdAt: Date;

  @UpdateDateColumn({ type: Date })
  updatedAt: Date;

  @Column({ type: Date, nullable: true })
  deletedAt?: Date | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  createdBy?: string | null;

  @BeforeInsert()
  protected generateId(): void {
    if (!this.id) this.id = randomUUID();
  }
}