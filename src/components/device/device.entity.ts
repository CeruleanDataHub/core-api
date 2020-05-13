import { Entity, Column, PrimaryGeneratedColumn, Generated, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum DeviceType {
    Edge = "edge",
    Node = "node"
}

export enum DeviceStatus {
    Created = "created",
    Active = "active",
    Inactive = "inactive"
}

@Entity({ name: 'device' })
export class Device {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    @Generated("uuid")
    uuid: string

    @Column({ nullable: true })
    external_id: string;

    @ManyToOne(type => Device)
    @JoinColumn({ name: "parent_id", referencedColumnName: "id" })
    parent: Device;

    @Column()
    name: string

    @Column({ nullable: true })
    description: string

    @Column()
    deviceEnrollmentGroupId: string

    @Column({
        type: "enum",
        enum: DeviceType,
        default: DeviceType.Node
    })
    type: DeviceType

    @Column({ type: "point", nullable: true })
    location: string

    @CreateDateColumn({ type: "timestamp"})
    created: Date

    @UpdateDateColumn({ type: "timestamp"})
    modified: Date

    @Column({
        type: "enum",
        enum: DeviceStatus,
        default: DeviceStatus.Created
    })
    status: DeviceStatus
}
