from datetime import datetime, timezone
from app.extensions import db

class Alert(db.Model):
    """Alert record database model for threshold violations."""
    __tablename__ = "alerts"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reading_id = db.Column(db.Integer, db.ForeignKey("readings.id", ondelete="CASCADE"), nullable=True)
    device_id = db.Column(db.String(64), nullable=False, default="esp32_dht11_primary", index=True)
    alert_type = db.Column(db.String(32), nullable=False)  # e.g., 'HIGH_TEMP', 'LOW_TEMP', etc.
    severity = db.Column(db.String(16), nullable=False, default="warning")  # 'warning', 'critical'
    message = db.Column(db.String(255), nullable=False)
    threshold_value = db.Column(db.Float, nullable=False)
    actual_value = db.Column(db.Float, nullable=False)
    timestamp = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True
    )
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    def to_dict(self):
        """Serialize alert instance to JSON-compatible dictionary."""
        return {
            "id": self.id,
            "reading_id": self.reading_id,
            "device_id": self.device_id,
            "alert_type": self.alert_type,
            "severity": self.severity,
            "message": self.message,
            "threshold_value": round(float(self.threshold_value), 2),
            "actual_value": round(float(self.actual_value), 2),
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "is_active": self.is_active,
        }

    def __repr__(self):
        return f"<Alert id={self.id} type={self.alert_type} val={self.actual_value} thresh={self.threshold_value}>"
