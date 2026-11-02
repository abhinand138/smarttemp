from datetime import datetime, timezone
from flask import jsonify
from sqlalchemy import text
from app.routes import general_bp
from app.extensions import db

@general_bp.route("/", methods=["GET"])
def home():
    """Root endpoint to verify the backend is running."""
    return jsonify({
        "project": "SmartTemp",
        "title": "SmartTemp – Intelligent Temperature and Humidity Monitoring System",
        "status": "online",
        "message": "SmartTemp backend API is running successfully.",
        "version": "1.0.0"
    }), 200

@general_bp.route("/api/status", methods=["GET"])
def status():
    """Backend status and database health check endpoint."""
    db_status = "disconnected"
    try:
        db.session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return jsonify({
        "application": "SmartTemp",
        "backend": "Flask",
        "status": "online",
        "version": "1.0.0",
        "database": db_status,
        "database_name": "smarttemp_db",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "health": "healthy" if db_status == "connected" else "degraded"
    }), 200
