import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IoTDevice } from '../iot-device/iot-device.entity';

@Entity({ name: 'telemetry' })
export class Telemetry {
    @PrimaryColumn()
    time: Date;

    @ManyToOne(type => IoTDevice)
    @JoinColumn({ name: "iot_device_id" })
    iotDevice: IoTDevice;

    @Column({ nullable: true })
    temperature: string;

    @Column({ nullable: true })
    humidity: string;

    @Column({ nullable: true })
    pressure: string;

    @Column({ nullable: true })
    txpower: string;

    @Column({ nullable: true })
    rssi: string;

    @Column({ nullable: true })
    voltage: string;

    public static getKeys(): string[] {
        console.log(Object.keys(this.prototype));
        return Object.keys(this.prototype);
    }
}
