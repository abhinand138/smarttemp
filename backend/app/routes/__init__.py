from flask import Blueprint

# Blueprint for general endpoints
general_bp = Blueprint("general", __name__)

from app.routes import general  # noqa: E402, F401
from app.routes.readings import readings_bp  # noqa: E402

__all__ = ["general_bp", "readings_bp"]
