#!/bin/sh
set -e

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
until nc -z mysql 3306; do
    echo "MySQL is unavailable - sleeping"
    sleep 2
done
echo "MySQL is up - continuing"

# Additional wait to ensure MySQL is fully initialized
sleep 5

# Enable SQL module by creating symlink
if [ ! -L /etc/freeradius/mods-enabled/sql ]; then
    ln -s /etc/freeradius/mods-available/sql /etc/freeradius/mods-enabled/sql
fi

# Enable default site
if [ ! -L /etc/freeradius/sites-enabled/default ]; then
    ln -s /etc/freeradius/sites-available/default /etc/freeradius/sites-enabled/default
fi

# Execute the original entrypoint with all arguments
exec /docker-entrypoint.sh "$@"
