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

export enum HierarchyStatus {
    Created = 'created',
    Active = 'active',
    Inactive = 'inactive',
}

@Entity({ name: 'hierarchy' })
export class Hierarchy {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    @Generated('uuid')
    uuid: string;

    @ManyToOne(type => Hierarchy)
    @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
    parent: Hierarchy;

    @Column({ nullable: true })
    tenant_id: string;

    // parent.path + ownUUID + /
    @Column()
    path: string;

    @Column()
    type: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'point', nullable: true })
    location: string;

    @CreateDateColumn({ type: 'timestamp' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modified: Date;

    @Column({
        type: 'enum',
        enum: HierarchyStatus,
        default: HierarchyStatus.Created,
    })
    status: HierarchyStatus;
}
