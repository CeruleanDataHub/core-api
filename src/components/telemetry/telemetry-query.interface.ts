import { FindOperator } from "typeorm"

type WhereClause = {
    time: string | null,
    iot_device_id: string | null,
    temperature: string | FindOperator<string> | null,
    humidity: string | FindOperator<string> | null,
    pressure: string | FindOperator<string> | null,
    txpower: string | FindOperator<string> | null,
    rssi: string | FindOperator<string> | null,
    voltage: string | FindOperator<string> | null
}

type OrderClause = {
    time: "ASC" | "DESC" | null,
    iot_device_id: "ASC" | "DESC" | null,
    temperature: "ASC" | "DESC" | null,
    humidity: "ASC" | "DESC" | null,
    pressure: "ASC" | "DESC" | null,
    txpower: "ASC" | "DESC" | null,
    rssi: "ASC" | "DESC" | null,
    voltage: "ASC" | "DESC" | null
}

export interface TelemetryQueryObjectType {
    select: ("time" | "iotDevice" | "temperature" | "humidity" | "pressure" | "txpower" | "rssi" | "voltage")[],
    relations: ("iotDevice")[],
    where: WhereClause,
    order: OrderClause,
    skip: number | null,
    take: number | null,
    cache: boolean | null,
    temperature: string | FindOperator<string> | null,
    humidity: string | FindOperator<string> | null,
    pressure: string | FindOperator<string> | null,
    txpower: string | FindOperator<string> | null,
    rssi: string | FindOperator<string> | null,
    voltage: string | FindOperator<string> | null
}

