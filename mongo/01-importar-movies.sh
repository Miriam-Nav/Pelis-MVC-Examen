#!/bin/bash
set -e
mongoimport \
  --username "$MONGO_INITDB_ROOT_USERNAME" \
  --password "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --db movies --collection movies \
  --jsonArray --file /docker-entrypoint-initdb.d/movies.json