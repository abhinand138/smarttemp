#!/bin/sh
set -e

echo "[*] =========================================="
echo "[*] SmartTemp Backend Starting Up"
echo "[*] =========================================="

echo "[*] Checking PostgreSQL connectivity..."
python - << 'EOF'
import sys
import time
import os
from sqlalchemy import create_engine, text

db_url = os.environ.get("DATABASE_URL")
if not db_url:
    user = os.environ.get("DB_USER", "postgres")
    password = os.environ.get("DB_PASSWORD", "postgres")
    host = os.environ.get("DB_HOST", "db")
    port = os.environ.get("DB_PORT", "5432")
    dbname = os.environ.get("DB_NAME", "smarttemp_db")
    db_url = f"postgresql+psycopg://{user}:{password}@{host}:{port}/{dbname}"

engine = create_engine(db_url, pool_pre_ping=True)

max_retries = 30
for attempt in range(1, max_retries + 1):
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"[+] PostgreSQL connection verified on attempt {attempt}.")
        sys.exit(0)
    except Exception as exc:
        print(f"[*] Waiting for database ({host}:{port}/{dbname})... [{attempt}/{max_retries}]")
        time.sleep(1)

print("[-] Error: Timed out waiting for PostgreSQL connection.", file=sys.stderr)
sys.exit(1)
EOF

echo "[*] Verifying database schema and tables..."
python - << 'EOF'
from app import create_app
from app.extensions import db

app = create_app()
with app.app_context():
    db.create_all()
    print("[+] Database tables initialized successfully.")
EOF

if [ "$SEED_DEMO_DATA" = "true" ] || [ "$SEED_DEMO_DATA" = "1" ]; then
    echo "[*] SEED_DEMO_DATA is set to true. Populating demo readings..."
    python seed_data.py || echo "[!] Notice: Seed script completed."
fi

echo "[*] Starting Gunicorn server on 0.0.0.0:5000..."
exec gunicorn \
    --bind 0.0.0.0:5000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    "app:create_app()"
