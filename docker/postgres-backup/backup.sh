#!/bin/sh
set -e

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="/backups/backup_$DATE.sql.gz"

echo "⏳ Creating backup: $FILENAME"

PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
  -U $POSTGRES_USER \
  -h ${POSTGRES_HOST:-postgres} \
  -p ${POSTGRES_PORT:-5432} \
  -d $POSTGRES_DB | gzip > "$FILENAME"

echo "✅ Backup finished: $FILENAME"
