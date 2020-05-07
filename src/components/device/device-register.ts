import { Client as IotHubClient } from 'azure-iothub';
import { createHmac } from 'crypto';
import { Mqtt as ProvisioningTransport } from 'azure-iot-provisioning-device-mqtt';
import { SymmetricKeySecurityClient } from 'azure-iot-security-symmetric-key';
import { ProvisioningDeviceClient } from 'azure-iot-provisioning-device';

const provisioningHost = process.env.PROVISIONING_HOST;
const idScope = process.env.ID_SCOPE;
const primaryKey = process.env.PRIMARY_KEY;
const serviceConnectionString = process.env.IOTHUB_SERVICE_CONNECTION;
const mockRegister = process.env.MOCKREGISTER;

const EDGE_DEVICE_MODULE = "RuuviTagGateway";
const DEVICE_REGISTRATION_ATTEMPTED_METHOD = "DeviceRegistrationAttempted";

const iotHubClient = IotHubClient.fromConnectionString(serviceConnectionString);

const computeDerivedSymmetricKey = (primaryKey: string, registrationId: string): string => {
    return createHmac("SHA256", Buffer.from(primaryKey, "base64"))
        .update(registrationId, "utf8")
        .digest("base64");
};

const MESSAGE = {
    "DEVICE_REGISTRATION_FAILURE": "Error registering the device",
    "EDGE_DEVICE_DOES_NOT_EXISTS": "Edge device does not exists in the database",
    "DEVICE_ALREADY_ASSIGNED": "IoT device is already assigned to other edge device",
    "GENERIC_SUCCESS": "Registration successful"
}

class ReturnObject {
    wasSuccessful: boolean = false
    registrationId: string = null
    edgeDeviceId: string = null
    message: string = MESSAGE.DEVICE_REGISTRATION_FAILURE;
}

const registerDevice = async (registrationId: string): Promise<void> => {
    const symmetricKey = computeDerivedSymmetricKey(primaryKey, registrationId);
    const provisioningSecurityClient = new SymmetricKeySecurityClient(registrationId, symmetricKey);
    const provisioningClient = ProvisioningDeviceClient.create(
        provisioningHost,
        idScope,
        new ProvisioningTransport(),
        provisioningSecurityClient
    );

    if (mockRegister) {
        return new Promise((resolve, _) => {
            console.log("MOCKING REGISTRATION");
            resolve();
        })
    } else {
        return await doRegister(provisioningClient);
    }
};

const doRegister = (provisioningClient): Promise<void> => {
    return new Promise((resolve, reject) => {
        provisioningClient.register((err: Error) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const invokeDirectMethod = (edgeDeviceId: string, moduleId: string, method: string, payload: ReturnObject) => {
    console.log('Invoking direct method ' + method + ' on device ' + edgeDeviceId);

    const methodParams = {
        methodName: method,
        payload: payload,
        responseTimeoutInSeconds: 30
    };

    return new Promise((resolve, reject) => {
        iotHubClient.invokeDeviceMethod(edgeDeviceId, moduleId, methodParams, function (err: Error) {
            if (err) {
                console.error('Failed to invoke method '  + method + ': ' + err.message);
                reject(err);
            } else {
                console.log('Method ' + method + ' invoked succesfully');
                resolve(payload);
            }
        });
    })
}
const sendMessage = (registrationId, edgeDeviceId, wasSuccessful, message) => {
    const obj = new ReturnObject();
    obj.registrationId = registrationId;
    obj.edgeDeviceId = edgeDeviceId
    obj.message = message;
    obj.wasSuccessful = wasSuccessful;

    invokeDirectMethod(edgeDeviceId, EDGE_DEVICE_MODULE, DEVICE_REGISTRATION_ATTEMPTED_METHOD, obj)
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
}

const sendDeviceAlreadyAssigned = (registrationId: string, edgeDeviceId: string) => {
    console.log("Sending device already assigned");
    sendMessage(registrationId, edgeDeviceId, false, MESSAGE.DEVICE_ALREADY_ASSIGNED);
}

const sendEdgeDeviceDoesNotExist = (registrationId: string, edgeDeviceId: string) => {
    console.log("Sending edge device does not exist");
    sendMessage(registrationId, edgeDeviceId, false, MESSAGE.EDGE_DEVICE_DOES_NOT_EXISTS);
}

const sendDeviceRegistrationSuccess = (registrationId: string, edgeDeviceId: string) => {
    console.log("Sending device registration success");
    sendMessage(registrationId, edgeDeviceId, true, MESSAGE.GENERIC_SUCCESS);
}

export { registerDevice, sendEdgeDeviceDoesNotExist, sendDeviceRegistrationSuccess, sendDeviceAlreadyAssigned }
