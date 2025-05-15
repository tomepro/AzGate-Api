import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ synchronize: false })
export class gm_ticket extends BaseEntity {
   @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  type: number; // 0 open, 1 closed, 2 char...

  @Column({ type: 'int', unsigned: true, default: 0 })
  playerGuid: number; // Global Unique Identifier...

  @Column({ type: 'varchar', length: 12, nullable: true })
  name: string | null; // Name of ticket creator

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', unsigned: true, default: 0 })
  createTime: number;

  @Column({ type: 'smallint', unsigned: true, default: 0 })
  mapId: number;

  @Column({ type: 'float', default: 0 })
  posX: number;

  @Column({ type: 'float', default: 0 })
  posY: number;

  @Column({ type: 'float', default: 0 })
  posZ: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  lastModifiedTime: number;

  @Column({ type: 'int', default: 0 })
  closedBy: number; // -1 Closed by Console...

  @Column({ type: 'int', unsigned: true, default: 0 })
  assignedTo: number; // GUID of admin who...

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'text', nullable: true })
  response: string | null;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  completed: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  escalated: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  viewed: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  needMoreHelp: number;

  @Column({ type: 'int', default: 0 })
  resolvedBy: number; // -1 Resolved by Console...
}