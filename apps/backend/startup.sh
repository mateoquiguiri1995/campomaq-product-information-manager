#!/usr/bin/env sh
set -e

PORT="${WEBSITES_PORT:-8000}"
WORKERS="${WEB_CONCURRENCY:-2}"
THREADS="${GUNICORN_THREADS:-4}"
TIMEOUT="${GUNICORN_TIMEOUT:-200}"

echo "Starting gunicorn on port ${PORT} with ${WORKERS} workers, ${THREADS} threads, timeout ${TIMEOUT}"
exec gunicorn --bind "0.0.0.0:${PORT}" --workers "${WORKERS}" --threads "${THREADS}" --timeout "${TIMEOUT}" app:app