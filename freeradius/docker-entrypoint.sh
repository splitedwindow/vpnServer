#!/bin/sh
set -e

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
