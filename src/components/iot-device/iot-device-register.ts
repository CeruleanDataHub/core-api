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
    "DEVICE_DOES_NOT_EXISTS": "IoT or Edge Device does not exists in database or IoT device is already assigned.",
    "GENERIC_SUCCESS": "Registration successful"
}

class ReturnObject {
    wasSuccessful: boolean = false
    registrationId: string = null
    edgeDeviceId: string = null
    message: string = MESSAGE.DEVICE_REGISTRATION_FAILURE;
}

const registerDevice = async (registrationId: string, edgeDeviceId: string): Promise<ReturnObject> => {
    const baseReturnObject = new ReturnObject();

    const symmetricKey = computeDerivedSymmetricKey(primaryKey, registrationId);
    const provisioningSecurityClient = new SymmetricKeySecurityClient(registrationId, symmetricKey);
    const provisioningClient = ProvisioningDeviceClient.create(
        provisioningHost,
        idScope,
        new ProvisioningTransport(),
        provisioningSecurityClient
    );

    return new Promise( async(resolve, reject) => {
        if (mockRegister) {
            baseReturnObject.wasSuccessful = true;
            console.log("MOCKING REGISTRATION: ", baseReturnObject);
            invokeDirectMethod(edgeDeviceId, EDGE_DEVICE_MODULE, DEVICE_REGISTRATION_ATTEMPTED_METHOD, baseReturnObject)
                .then(_ => {
                    resolve(baseReturnObject);
                })
                .catch(err => {
                    console.log("error mock register: ", err);
                });
        } else {
            const registerResult = await doRegister(
                provisioningClient,
                baseReturnObject
            );

            console.log("Sending register device");
            invokeDirectMethod(edgeDeviceId, EDGE_DEVICE_MODULE, DEVICE_REGISTRATION_ATTEMPTED_METHOD, registerResult)
                .then(_ => {
                    resolve(registerResult);
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        }
    });
};

const doRegister = (provisioningClient, baseReturnObject: ReturnObject): Promise<ReturnObject> => {
    return new Promise((resolve, reject) => {
        provisioningClient.register((err: Error) => {
            if (err) {
                reject(baseReturnObject);
            } else {
                baseReturnObject.message = MESSAGE.GENERIC_SUCCESS;
                baseReturnObject.wasSuccessful = true;
                resolve(baseReturnObject);
            }
        });
    });
};

const invokeDirectMethod = (edgeDeviceId, moduleId, method, payload) => {
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

const sendDeviceDoesNotExist = (registrationId: string, edgeDeviceId: string) => {
    const obj = new ReturnObject();
    obj.message = MESSAGE.DEVICE_DOES_NOT_EXISTS;
    obj.registrationId = registrationId;
    obj.edgeDeviceId = edgeDeviceId

    console.log("Sending device does not exist");
    invokeDirectMethod(edgeDeviceId, EDGE_DEVICE_MODULE, DEVICE_REGISTRATION_ATTEMPTED_METHOD, obj)
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
}

const sendDeviceRegistrationSuccess = (registrationId: string, edgeDeviceId: string) => {
    const obj = new ReturnObject();
    obj.message = MESSAGE.GENERIC_SUCCESS;
    obj.registrationId = registrationId;
    obj.edgeDeviceId = edgeDeviceId
    obj.wasSuccessful = true;

    console.log("Sending device registration success");
    invokeDirectMethod(edgeDeviceId, EDGE_DEVICE_MODULE, DEVICE_REGISTRATION_ATTEMPTED_METHOD, obj)
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
}

export { registerDevice, sendDeviceDoesNotExist, sendDeviceRegistrationSuccess }
