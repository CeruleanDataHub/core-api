import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EdgeDevice } from '../edge-device/edgeDevice.entity';

@Entity({ name: 'iot_devices' })
export class IoTDevice {
    @PrimaryColumn()
    id: string;

    @Column({ nullable: true })
    address: string;

    @ManyToOne(type => EdgeDevice)
    edgeDevice: EdgeDevice;
}
