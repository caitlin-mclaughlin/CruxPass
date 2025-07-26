## Backend
```
cd backend
./gradlew bootRun
```
or build with
```
./gradlew build
'''

## Frontend
```
cd frontend
npm install       # once
npm run dev       # to start local dev server
```

## Rebuild, Redeploy, and Verify
```
// Rebuild the backend JAR
./gradlew bootJar

// Rebuild Docker image
docker build -t caitlinmclaugh/cruxpass-backend:latest ./backend

// Remove stack and clean state
docker stack rm cruxpass
docker secret rm jwt_secret
rm .jwt_secret

// Regenerate secret
openssl rand -base64 32 > .jwt_secret
docker secret create jwt_secret .jwt_secret

//Re-deploy
docker stack deploy -c docker-compose.yml cruxpass

// Wait 5-10s and run logs
docker service logs cruxpass_backend
```


## Database
docker exec -it f705fb495b74 psql -U postgres -d cruxpass
(replace id with value shown by "docker ps")