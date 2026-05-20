#!/bin/bash

# Database connection details
DB_HOST="103.17.193.168"
DB_USER="root"
DB_PASSWORD="tanuj1221"
DB_NAME="sh_demo"

# Output file with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_FILE="sh_demo_backup_${TIMESTAMP}.sql"

echo "=========================================="
echo "MySQL Database Backup Script"
echo "=========================================="
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "Output: $OUTPUT_FILE"
echo "=========================================="

# Check if mysqldump is installed
if ! command -v mysqldump &> /dev/null; then
    echo "❌ Error: mysqldump is not installed"
    echo "Install it with: sudo apt install mysql-client"
    exit 1
fi

# Create backup
echo "📦 Starting backup..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$OUTPUT_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Backup completed successfully!"
    echo "📁 File: $OUTPUT_FILE"
    echo "📊 Size: $FILE_SIZE"
    echo ""
    echo "To restore this backup, use:"
    echo "mysql -h HOST -u USER -pPASSWORD DATABASE < $OUTPUT_FILE"
else
    echo "❌ Backup failed!"
    exit 1
fi
