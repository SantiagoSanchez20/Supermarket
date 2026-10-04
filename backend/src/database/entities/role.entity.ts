import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum RoleType {
  ADMIN = 'ADMIN',
  CAJERO = 'CAJERO',
  ABASTECIMIENTO = 'ABASTECIMIENTO',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    unique: true,
  })
  name: RoleType;

  @Column({ nullable: true })
  description: string;
}
