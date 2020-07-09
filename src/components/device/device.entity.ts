import { Entity, Column, PrimaryGeneratedColumn, Generated, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'

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
    @ApiProperty()
    id: string;

    @Column()
    @Generated("uuid")
    @ApiProperty()
    uuid: string

    @Column({ nullable: true })
    @ApiProperty()
    external_id: string;

    @ManyToOne(type => Device)
    @JoinColumn({ name: "parent_id", referencedColumnName: "id" })
    @ApiProperty({ type: Device, required: false })
    parent: Device;

    @Column()
    @ApiProperty()
    name: string

    @Column({ nullable: true })
    @ApiProperty({ required: false })
    description: string

    @Column()
    @ApiProperty()
    deviceEnrollmentGroupId: string

    @Column({
        type: "enum",
        enum: DeviceType,
        default: DeviceType.Node
    })
    @ApiProperty()
    type: DeviceType

    @Column({ type: "point", nullable: true })
    @ApiProperty({ required: false })
    location: string

    @CreateDateColumn({ type: "timestamp"})
    @ApiProperty()
    created: Date

    @UpdateDateColumn({ type: "timestamp"})
    @ApiProperty()
    modified: Date

    @Column({
        type: "enum",
        enum: DeviceStatus,
        default: DeviceStatus.Created
    })
    @ApiProperty()
    status: DeviceStatus

    @Column()
    @ApiProperty()
    path: string

    @Column({ nullable: true })
    @ApiProperty({ required: false })
    hierarchy_id: string
}
