# stop.sh
set -e

SECRET_NAME="jwt_secret"
STACK_NAME="cruxpass"

echo "Stopping Docker stack: $STACK_NAME"
docker stack rm $STACK_NAME

# Wait for stack to shut down completely
echo "Waiting for stack services to stop..."
while docker stack services $STACK_NAME 2>/dev/null | grep -q '\<'; do
  sleep 1
done

# Remove Docker secret if it exists
if docker secret ls --format '{{.Name}}' | grep -q "^${SECRET_NAME}$"; then
  echo "Removing Docker secret: $SECRET_NAME"
  docker secret rm $SECRET_NAME
fi

# Optional: Leave the swarm (uncomment if you want to leave)
# echo "Leaving Docker Swarm..."
# docker swarm leave --force

echo "✅ Shutdown complete."
