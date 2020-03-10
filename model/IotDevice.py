
class IotDevice(db.Model):
    __tablename__ = 'iot_devices'

    id = db.Column(db.String(200), primary_key=True)
    address = db.Column(db.String(200), unique=False, nullable=True)
    edge_device_id = db.Column(db.ForeignKey(EdgeDevice.id))
    edgeDevice = db.relationship("EdgeDevice", back_populates="iotDevice")

    def __repr__(self):
        return '<iot_device %r>' % self.id
