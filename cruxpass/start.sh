# start.sh
set -e

SECRET_NAME="jwt_secret"
SECRET_FILE=".jwt_secret"

# Step 1: Init Swarm if not already initialized
if ! docker info | grep -q 'Swarm: active'; then
  echo "Initializing Docker Swarm..."
  docker swarm init
else
  echo "Docker Swarm already initialized."
fi

# Step 2: Generate secret file if missing
if [ ! -f "$SECRET_FILE" ]; then
  echo "Generating new JWT secret file..."
  openssl rand -base64 32 > "$SECRET_FILE"
else
  echo "JWT secret file exists."
fi

# Step 3: Create or update the Docker secret
if docker secret ls --format '{{.Name}}' | grep -q "^${SECRET_NAME}$"; then
  echo "Removing existing Docker secret: $SECRET_NAME"
  docker secret rm $SECRET_NAME
fi

echo "Creating Docker secret: $SECRET_NAME"
docker secret create $SECRET_NAME $SECRET_FILE

# Step 4: Build backend image locally
echo "Building backend image..."
docker build -t cruxpass-backend:latest ./backend

# Step 5: Deploy the stack
echo "Deploying stack..."
docker stack deploy -c docker-compose.yml cruxpass

echo "Deployment complete!"