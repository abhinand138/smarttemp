# ==========================================
# SmartTemp Backend Dockerfile
# Python 3.12 Flask REST API with Gunicorn
# ==========================================
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies (curl for healthchecks)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy application source code
COPY . .

# Copy entrypoint script and ensure Unix line endings + execute permissions
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# Create non-root system user for security
RUN groupadd -r smarttemp && useradd -r -g smarttemp -d /app smarttemp \
    && chown -R smarttemp:smarttemp /app

USER smarttemp

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1:5000/api/status || exit 1

ENTRYPOINT ["./entrypoint.sh"]
