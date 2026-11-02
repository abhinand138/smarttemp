from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# SQLAlchemy database instance
db = SQLAlchemy()

# CORS instance for cross-origin frontend support
cors = CORS()
