import logging
from flask import current_app
from app.extensions import db
from app.models import Reading, Alert

logger = logging.getLogger(__name__)

class AlertService:
    """Service to evaluate sensor readings against configurable thresholds."""

    @staticmethod
    def get_thresholds():
        """Retrieve threshold limits from application configuration."""
        return {
            "temp_high": current_app.config.get("ALERT_TEMP_HIGH", 35.0),
            "temp_low": current_app.config.get("ALERT_TEMP_LOW", 15.0),
            "humidity_high": current_app.config.get("ALERT_HUMIDITY_HIGH", 80.0),
            "humidity_low": current_app.config.get("ALERT_HUMIDITY_LOW", 30.0),
        }

    @classmethod
    def evaluate_reading(cls, reading: Reading):
        """
        Evaluate a newly saved sensor reading.
        Creates an alert if a threshold is crossed and no active alert exists for that type.
        Resolves active alerts when values return to the normal range.
        """
        thresholds = cls.get_thresholds()
        temp = reading.temperature
        hum = reading.humidity
        device_id = reading.device_id
        generated_alerts = []

        # 1. Temperature Checks
        # High Temperature
        if temp > thresholds["temp_high"]:
            alert = cls._ensure_active_alert(
                reading=reading,
                device_id=device_id,
                alert_type="HIGH_TEMP",
                severity="critical" if temp >= (thresholds["temp_high"] + 5) else "warning",
                message=f"High Temperature Alert: {temp}°C exceeds threshold of {thresholds['temp_high']}°C",
                threshold=thresholds["temp_high"],
                actual=temp
            )
            if alert:
                generated_alerts.append(alert)
        else:
            cls._resolve_alert_if_active(device_id, "HIGH_TEMP")

        # Low Temperature
        if temp < thresholds["temp_low"]:
            alert = cls._ensure_active_alert(
                reading=reading,
                device_id=device_id,
                alert_type="LOW_TEMP",
                severity="critical" if temp <= (thresholds["temp_low"] - 5) else "warning",
                message=f"Low Temperature Alert: {temp}°C is below threshold of {thresholds['temp_low']}°C",
                threshold=thresholds["temp_low"],
                actual=temp
            )
            if alert:
                generated_alerts.append(alert)
        else:
            cls._resolve_alert_if_active(device_id, "LOW_TEMP")

        # 2. Humidity Checks
        # High Humidity
        if hum > thresholds["humidity_high"]:
            alert = cls._ensure_active_alert(
                reading=reading,
                device_id=device_id,
                alert_type="HIGH_HUMIDITY",
                severity="warning",
                message=f"High Humidity Alert: {hum}% exceeds threshold of {thresholds['humidity_high']}%",
                threshold=thresholds["humidity_high"],
                actual=hum
            )
            if alert:
                generated_alerts.append(alert)
        else:
            cls._resolve_alert_if_active(device_id, "HIGH_HUMIDITY")

        # Low Humidity
        if hum < thresholds["humidity_low"]:
            alert = cls._ensure_active_alert(
                reading=reading,
                device_id=device_id,
                alert_type="LOW_HUMIDITY",
                severity="warning",
                message=f"Low Humidity Alert: {hum}% is below threshold of {thresholds['humidity_low']}%",
                threshold=thresholds["humidity_low"],
                actual=hum
            )
            if alert:
                generated_alerts.append(alert)
        else:
            cls._resolve_alert_if_active(device_id, "LOW_HUMIDITY")

        return generated_alerts

    @staticmethod
    def _ensure_active_alert(reading, device_id, alert_type, severity, message, threshold, actual):
        """Only create a new alert if an active alert for this type does NOT already exist."""
        existing_active = Alert.query.filter_by(
            device_id=device_id,
            alert_type=alert_type,
            is_active=True
        ).first()

        if not existing_active:
            new_alert = Alert(
                reading_id=reading.id,
                device_id=device_id,
                alert_type=alert_type,
                severity=severity,
                message=message,
                threshold_value=threshold,
                actual_value=actual,
                is_active=True
            )
            db.session.add(new_alert)
            logger.info(f"[ALERT TRIGGERED] {alert_type} on {device_id}: {message}")
            return new_alert
        return None

    @staticmethod
    def _resolve_alert_if_active(device_id, alert_type):
        """Resolve any active alert for this type if conditions have normalized."""
        active_alerts = Alert.query.filter_by(
            device_id=device_id,
            alert_type=alert_type,
            is_active=True
        ).all()

        for alert in active_alerts:
            alert.is_active = False
            logger.info(f"[ALERT RESOLVED] {alert_type} on {device_id} has normalized.")
