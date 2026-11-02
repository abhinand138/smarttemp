from datetime import datetime, timezone, time
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from app.extensions import db
from app.models import Reading, Alert
from app.utils.validators import validate_sensor_reading
from app.services.alert_service import AlertService

readings_bp = Blueprint("readings", __name__, url_prefix="/api")

@readings_bp.route("/readings", methods=["POST"])
def create_reading():
    """
    POST /api/readings
    Receive sensor readings from ESP32 or client.
    Validates payload, records reading, evaluates threshold alerts.
    """
    if not request.is_json:
        return jsonify({
            "success": False,
            "error": "Content-Type must be application/json."
        }), 400

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({
            "success": False,
            "error": "Invalid or malformed JSON payload."
        }), 400

    is_valid, error_msg, validated = validate_sensor_reading(data)
    if not is_valid:
        return jsonify({
            "success": False,
            "error": error_msg
        }), 400

    try:
        new_reading = Reading(
            device_id=validated["device_id"],
            temperature=validated["temperature"],
            humidity=validated["humidity"],
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(new_reading)
        db.session.flush()  # Populates new_reading.id before evaluating alerts

        # Check alerts for this reading
        triggered_alerts = AlertService.evaluate_reading(new_reading)

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Sensor reading recorded successfully.",
            "reading": new_reading.to_dict(),
            "alerts_triggered": [alert.to_dict() for alert in triggered_alerts]
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "error": "Database error while storing reading.",
            "details": str(e)
        }), 500

@readings_bp.route("/readings/latest", methods=["GET"])
def get_latest_reading():
    """
    GET /api/readings/latest
    Return the most recent recorded sensor reading.
    """
    reading = Reading.query.order_by(Reading.timestamp.desc()).first()
    if not reading:
        return jsonify({
            "success": True,
            "reading": None,
            "message": "No sensor readings recorded yet."
        }), 200

    return jsonify({
        "success": True,
        "reading": reading.to_dict()
    }), 200

@readings_bp.route("/readings", methods=["GET"])
def get_historical_readings():
    """
    GET /api/readings
    Return historical readings with pagination and optional date/device filtering.
    Query parameters:
    - page: int (default 1)
    - limit: int (default 50, max 200)
    - start_date: ISO date / YYYY-MM-DD
    - end_date: ISO date / YYYY-MM-DD
    - device_id: string
    """
    try:
        page = max(1, int(request.args.get("page", 1)))
        limit = min(200, max(1, int(request.args.get("limit", 50))))
    except ValueError:
        return jsonify({"success": False, "error": "Invalid pagination parameters."}), 400

    query = Reading.query

    # Optional device_id filter
    device_id = request.args.get("device_id")
    if device_id:
        query = query.filter(Reading.device_id == device_id)

    # Optional date filters
    start_date_str = request.args.get("start_date")
    if start_date_str:
        try:
            start_date = datetime.fromisoformat(start_date_str.replace("Z", "+00:00"))
            query = query.filter(Reading.timestamp >= start_date)
        except ValueError:
            return jsonify({"success": False, "error": "Invalid start_date format. Use ISO format or YYYY-MM-DD."}), 400

    end_date_str = request.args.get("end_date")
    if end_date_str:
        try:
            end_date = datetime.fromisoformat(end_date_str.replace("Z", "+00:00"))
            query = query.filter(Reading.timestamp <= end_date)
        except ValueError:
            return jsonify({"success": False, "error": "Invalid end_date format. Use ISO format or YYYY-MM-DD."}), 400

    total = query.count()
    readings = query.order_by(Reading.timestamp.desc()).offset((page - 1) * limit).limit(limit).all()

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return jsonify({
        "success": True,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "readings": [r.to_dict() for r in readings]
    }), 200

@readings_bp.route("/readings/today", methods=["GET"])
def get_today_readings():
    """
    GET /api/readings/today
    Return all readings recorded today (UTC midnight to present) in chronological order for charting.
    """
    now = datetime.now(timezone.utc)
    today_start = datetime.combine(now.date(), time.min).replace(tzinfo=timezone.utc)

    readings = Reading.query.filter(
        Reading.timestamp >= today_start
    ).order_by(Reading.timestamp.asc()).all()

    return jsonify({
        "success": True,
        "date": now.date().isoformat(),
        "count": len(readings),
        "readings": [r.to_dict() for r in readings]
    }), 200

@readings_bp.route("/stats", methods=["GET"])
def get_today_stats():
    """
    GET /api/stats
    Return today's minimum, maximum, and average temperature and humidity.
    """
    now = datetime.now(timezone.utc)
    today_start = datetime.combine(now.date(), time.min).replace(tzinfo=timezone.utc)

    stats_query = db.session.query(
        func.min(Reading.temperature).label("min_temp"),
        func.max(Reading.temperature).label("max_temp"),
        func.avg(Reading.temperature).label("avg_temp"),
        func.min(Reading.humidity).label("min_hum"),
        func.max(Reading.humidity).label("max_hum"),
        func.avg(Reading.humidity).label("avg_hum"),
        func.count(Reading.id).label("count")
    ).filter(Reading.timestamp >= today_start).first()

    if not stats_query or stats_query.count == 0:
        return jsonify({
            "success": True,
            "date": now.date().isoformat(),
            "reading_count": 0,
            "temperature": {"min": None, "max": None, "avg": None},
            "humidity": {"min": None, "max": None, "avg": None},
            "message": "No readings recorded today yet."
        }), 200

    return jsonify({
        "success": True,
        "date": now.date().isoformat(),
        "reading_count": stats_query.count,
        "temperature": {
            "min": round(float(stats_query.min_temp), 2) if stats_query.min_temp is not None else None,
            "max": round(float(stats_query.max_temp), 2) if stats_query.max_temp is not None else None,
            "avg": round(float(stats_query.avg_temp), 2) if stats_query.avg_temp is not None else None,
        },
        "humidity": {
            "min": round(float(stats_query.min_hum), 2) if stats_query.min_hum is not None else None,
            "max": round(float(stats_query.max_hum), 2) if stats_query.max_hum is not None else None,
            "avg": round(float(stats_query.avg_hum), 2) if stats_query.avg_hum is not None else None,
        }
    }), 200

@readings_bp.route("/alerts", methods=["GET"])
def get_recent_alerts():
    """
    GET /api/alerts
    Return recent threshold alerts.
    Query parameters:
    - limit: int (default 20, max 100)
    - active_only: bool (default false, true to filter active alerts only)
    """
    try:
        limit = min(100, max(1, int(request.args.get("limit", 20))))
    except ValueError:
        limit = 20

    active_only = request.args.get("active_only", "false").lower() in ("true", "1", "yes")

    query = Alert.query
    if active_only:
        query = query.filter(Alert.is_active.is_(True))

    alerts = query.order_by(Alert.timestamp.desc()).limit(limit).all()

    return jsonify({
        "success": True,
        "count": len(alerts),
        "alerts": [a.to_dict() for a in alerts]
    }), 200
