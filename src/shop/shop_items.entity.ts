import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ synchronize: false })
export class shop_items extends BaseEntity {
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