# backend/Dockerfile

### BUILD ###
FROM gradle:8.10.0-jdk17 AS builder

WORKDIR /app
COPY . .

RUN gradle clean build -x test --no-daemon

### RUNTIME ###
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy built jar from the previous stage
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

# Run in prod mode
ENTRYPOINT ["java", "-jar", "app.jar"]
