#!/bin/sh
# Generate a 256-bit base64-encoded secret
export JWT_SECRET=$(openssl rand -base64 32)
echo "Generated JWT_SECRET: $JWT_SECRET"

echo "Launching containers..."
docker compose up --build
