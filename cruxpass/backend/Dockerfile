# backend/Dockerfile

### BUILD STAGE ###
#FROM gradle:8.10.0-jdk17 AS builder

#WORKDIR /app

# Copy only Gradle wrapper and build files first to cache dependencies
#COPY gradlew .
#COPY gradle/ gradle/
#COPY build.gradle .

# Download dependencies only (creates a reusable cache layer)
#RUN ./gradlew dependencies --no-daemon

#COPY . .

#RUN ./gradlew clean build -x test --no-daemon

### RUNTIME STAGE ###
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy the built jar from the builder stage
#COPY --from=builder /app/build/libs/*.jar app.jar
ENV JAVA_TOOL_OPTIONS="-Dorg.postgresql.disableExtraFloatDigits=true"
COPY build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
