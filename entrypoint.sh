#!/bin/sh
set -e # Exit immediately if a command exits with a non-zero status (ensures failure on error)

# 1. Wait for Database Connection (Optional, but good practice)
echo "Waiting for PostgreSQL database to be available..."
until pg_isready -h db -p 5432 -U librestack; do
  echo "Database is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is up and running."

# 2. Run Database Migrations (This step will fail the container if migrations fail)
echo "Running database migrations..."
dotnet ef database update --connection "${ConnectionStrings__DefaultConnection}" || { echo "!!! MIGRATION FAILED !!!"; exit 1; }
echo "Migrations completed successfully."

# 3. Start the application (This will only run if steps 1 and 2 succeed)
echo "Starting .NET API..."
exec dotnet libreStack.dll