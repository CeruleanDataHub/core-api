import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from marshmallow import Schema, fields

def get_env_variable(name):
    try:
        return os.environ[name]
    except KeyError:
        message = "Expected environment variable '{}' not set.".format(name)
        raise Exception(message)

# the values of those depend on your setup
PGHOST = get_env_variable("PGHOST")
PGUSER = get_env_variable("PGUSER")
PGPASSWORD = get_env_variable("PGPASSWORD")
PGDATABASE = get_env_variable("PGDATABASE")

DB_URL = 'postgresql+psycopg2://{user}:{pw}@{url}/{db}'.format(user=PGUSER,pw=PGPASSWORD,url=PGHOST,db=PGDATABASE)

app = Flask(__name__)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
db = SQLAlchemy(app)

   
class EdgeDevice(db.Model):
    __tablename__ = 'edge_devices'

    id = db.Column(db.String(200), primary_key=True)
    name = db.Column(db.String(200), unique=False, nullable=True)
    iotDevice = db.relationship("IotDevice", back_populates="edgeDevice")

    def __repr__(self):
        return '<edge_device %r>' % self.id

class EdgeDeviceSchema(Schema):
    id = fields.Str()
    name = fields.Str()

class IotDevice(db.Model):
    __tablename__ = 'iot_devices'

    id = db.Column(db.String(200), primary_key=True)
    address = db.Column(db.String(200), unique=False, nullable=True)
    edge_device_id = db.Column(db.ForeignKey(EdgeDevice.id))
    edgeDevice = db.relationship("EdgeDevice", back_populates="iotDevice")

    def __repr__(self):
        return '<iot_device %r>' % self.id

class IotDeviceSchema(Schema):
    id = fields.Str()
    address = fields.Str()
    edge_device_id = fields.Str()



@app.route('/api/devices', methods = ['POST'])
def getDevices():
    data = request.json
    id = data.get('id')
    
    iotdev = IotDevice.query.get(id)
    iotdev.filter('')
    print(iotdev.edgeDevice);

    # if id is not None:
    #     iotDevices = IotDevice.query.get(id)
    #     iot_devices_schema = IotDeviceSchema(many=False)
    #     result = iot_devices_schema.dump(iotDevices)
    # else:
    #     all_IotDevices = IotDevice.query.all()
    #     iot_devices_schema = IotDeviceSchema(many=True)
    #     result = iot_devices_schema.dump(all_IotDevice)
    
    # return jsonify(result)
    return ":)"

if __name__ == '__main__':
    print()
    print("### Starting server...")
    print()
    app.run(debug=True, host='0.0.0.0', port=3003)