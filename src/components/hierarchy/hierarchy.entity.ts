import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum HierarchyStatus {
    Created = 'created',
    Active = 'active',
    Inactive = 'inactive',
}

@Entity({ name: 'hierarchy' })
export class Hierarchy {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: string;

    @Column()
    @Generated('uuid')
    @ApiProperty()
    uuid: string;

    @ManyToOne(type => Hierarchy)
    @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
    @ApiProperty({ type: 'Hierarchy' })
    parent: Hierarchy;

    @Column({ nullable: true })
    @ApiProperty()
    tenant_id: string;

    // parent.path + ownUUID + /
    @Column()
    @ApiProperty()
    path: string;

    @Column()
    @ApiProperty()
    type: string;

    @Column({ nullable: true })
    @ApiProperty()
    name: string;

    @Column({ nullable: true })
    @ApiProperty()
    description: string;

    @Column({ type: 'point', nullable: true })
    @ApiProperty()
    location: string;

    @CreateDateColumn({ type: 'timestamp' })
    @ApiProperty()
    created: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    @ApiProperty()
    modified: Date;

    @Column({
        type: 'enum',
        enum: HierarchyStatus,
        default: HierarchyStatus.Created,
    })
    @ApiProperty()
    status: HierarchyStatus;
}
