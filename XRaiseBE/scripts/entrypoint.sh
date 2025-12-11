#!/bin/bash

set -e
set -o errexit
set -o nounset

postgres_ready() {
  python <<END
import sys
import psycopg
from contextlib import suppress

try:
    conn = psycopg.connect(
        dbname="${POSTGRES_DB}",
        user="${POSTGRES_USER}",
        password="${POSTGRES_PASSWORD}",
        host="${POSTGRES_HOST}",
        port="${POSTGRES_PORT}",
    )
except psycopg.DatabaseError:
    sys.exit(-1)
finally:
    with suppress(Exception):
        conn.close()

sys.exit(0)

END
}
until postgres_ready; do
  >&2 echo 'Waiting for PostgresSQL to become available...'
  sleep 1
done
>&2 echo 'PostgresSQL is available'

python3 manage.py migrate --noinput
python3 manage.py createsuperuser --noinput || echo "Superuser creation failed, continuing..."

gunicorn backend.asgi:application
