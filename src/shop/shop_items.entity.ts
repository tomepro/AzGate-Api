import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Shop_Items extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  title: string;

  @Column()
  price: number;

  @Column()
  wowhead_link: string;

  @Column()
  data_wowhead: string;

  @Column()
  icon_link: string;

  @Column()
  active: number;

}