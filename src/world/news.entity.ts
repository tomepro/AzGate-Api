import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ synchronize: false })
export class Server_news extends BaseEntity {
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    created_at:number;

    @Column()
    title:string;

    @Column()
    type:number;

    @Column()
    image:string;

    @Column()
    author:string;

    @Column()
    text:string;
}