import logging
from flask import Flask
from app.config import Config
from app.extensions import db, cors

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
logger = logging.getLogger(__name__)

def create_app(config_class=Config):
    """Application factory pattern for SmartTemp Flask backend."""
    flask_app = Flask(__name__)
    flask_app.config.from_object(config_class)

    # Initialize extensions with CORS for local dev servers
    db.init_app(flask_app)
    cors.init_app(flask_app, resources={r"/api/*": {"origins": "*"}})

    # Import models so SQLAlchemy registers them with metadata
    from app.models import Reading, Alert  # noqa: F401

    # Register Blueprints
    from app.routes import general_bp, readings_bp
    flask_app.register_blueprint(general_bp)
    flask_app.register_blueprint(readings_bp)

    # Create tables automatically inside application context
    with flask_app.app_context():
        try:
            db.create_all()
            logger.info("Database tables verified/created successfully.")
        except Exception as e:
            logger.warning(f"Database table initialization notice: {e}")

    return flask_app
