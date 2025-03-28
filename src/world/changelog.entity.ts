import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ synchronize: false })
export class Changelog extends BaseEntity {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    created_at:number;

    @Column()
    text:string;
}