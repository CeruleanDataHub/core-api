import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { IoTDevice } from '../iot-device/iot-device.entity';

@Entity({ name: 'edge_devices' })
export class EdgeDevice {
    @PrimaryColumn()
    id: string;

    @Column({ nullable: true })
    name: string;

    @OneToMany(
        type => IoTDevice,
        iotDevice => iotDevice.id,
    )
    iotDevices: IoTDevice[];
}
