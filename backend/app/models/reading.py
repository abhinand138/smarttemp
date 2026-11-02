from datetime import datetime, timezone
from app.extensions import db

class Reading(db.Model):
    """Sensor reading database model for DHT11 temperature and humidity."""
    __tablename__ = "readings"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    device_id = db.Column(db.String(64), nullable=False, default="esp32_dht11_primary", index=True)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    timestamp = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    # Relationship to alerts triggered by this reading
    alerts = db.relationship("Alert", backref="reading", lazy="select", cascade="all, delete-orphan")

    def to_dict(self):
        """Serialize reading instance to JSON-compatible dictionary."""
        return {
            "id": self.id,
            "device_id": self.device_id,
            "temperature": round(float(self.temperature), 2),
            "humidity": round(float(self.humidity), 2),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }

    def __repr__(self):
        return f"<Reading id={self.id} temp={self.temperature}°C hum={self.humidity}% @ {self.timestamp}>"
