import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Generated,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum HierarhcyStatus {
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

    @Column()
    tenant_id: string;

    // parent.path + ownUUID + /
    @Column()
    path: string;

    @Column({ nullable: true })
    type: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'point', nullable: true })
    location: string;

    @CreateDateColumn({ type: 'timestamp' })
    created: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    modified: Date;

    @Column({
        type: 'enum',
        enum: HierarhcyStatus,
        default: HierarhcyStatus.Created,
    })
    status: HierarhcyStatus;
}
