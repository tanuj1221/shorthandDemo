# MySQL Database Backup Script for Windows
# Requires MySQL client tools to be installed

# Database connection details
$DB_HOST = "103.17.193.168"
$DB_USER = "root"
$DB_PASSWORD = "tanuj1221"
$DB_NAME = "sh_demo"

# Output file with timestamp
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$OUTPUT_FILE = "sh_demo_backup_$TIMESTAMP.sql"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "MySQL Database Backup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Host: $DB_HOST"
Write-Host "Database: $DB_NAME"
Write-Host "Output: $OUTPUT_FILE"
Write-Host "==========================================" -ForegroundColor Cyan

# Check if mysqldump is available
$mysqldump = Get-Command mysqldump -ErrorAction SilentlyContinue

if (-not $mysqldump) {
    Write-Host "❌ Error: mysqldump is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Download MySQL client tools from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
    exit 1
}

# Create backup
Write-Host "📦 Starting backup..." -ForegroundColor Yellow

try {
    & mysqldump -h $DB_HOST -u $DB_USER -p"$DB_PASSWORD" $DB_NAME | Out-File -FilePath $OUTPUT_FILE -Encoding UTF8
    
    if (Test-Path $OUTPUT_FILE) {
        $fileSize = (Get-Item $OUTPUT_FILE).Length / 1MB
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host "📁 File: $OUTPUT_FILE" -ForegroundColor Green
        Write-Host "📊 Size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Green
        Write-Host ""
        Write-Host "To restore this backup, use:" -ForegroundColor Cyan
        Write-Host "mysql -h HOST -u USER -pPASSWORD DATABASE < $OUTPUT_FILE" -ForegroundColor White
    } else {
        Write-Host "❌ Backup failed - file not created!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backup failed: $_" -ForegroundColor Red
    exit 1
}
