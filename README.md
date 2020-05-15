# iot-platform-api

NodeJS app that provides an API for managing devices, users and telemetry data in the iot-platform.

## Configuration

Following environment variables are supported:

```
PGHOST=<Postgres host>
PGPORT=<Posgres port>
PGUSER=<Postgres user>
PGPASSWORD=<Postgres password>
PGDATABASE=<Postgres database name>
PGSSL=<Use SSL in postgres connection, true / false>
PGCACERT=<CA-cert for postgres connection in base64 encoded string (needed for example if self-signed cert is used in Postgres server)>
AUTH0_API=<Auth0 API url>
AUTH0_CLIENT_ID=<Auth0 Client ID>
AUTH0_CLIENT_SECRET=<Auth0 Client secret>
IOTHUB_SERVICE_CONNECTION=<IoT Hub connection string>
MOCKREGISTER=<Mock device provisioning, true / false>
PROVISIONING_HOST=<Device provisioning service endpoint>
ID_SCOPE=<Device provisioning service ID Scope>
ENROLLMENT_GROUP_1_PRIMARY_KEY=<Primary key of the enrollment group 1>
ENROLLMENT_GROUP_2_PRIMARY_KEY=<Primary key of the enrollment group 2>
...
```

See [Device provisioning](#device-provisioning) for more details about ENROLLMENT_GROUP_x_PRIMARY_KEY env-vars.

## Development environment

In the development environment env-vars can be put into .env file in the project root.

```
# Install dependencies
npm install

# Start the application (listens on port 3000)
npm run start:dev
```

## Device provisioning

Device provisioning supports provisioning iot-devices to multiple enrollment groups. When a device is provisioned it is registered into the same enrollment group as the edge-device that initiated the registration. The primary-key of the enrollment group is read from an env-var with name ENROLLMENT_GROUP_\<id\>_PRIMARY_KEY, where \<id\> is the id of the enrollment group.
