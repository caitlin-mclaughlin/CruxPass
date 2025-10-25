# backend/Dockerfile
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

ENV JAVA_TOOL_OPTIONS="-Dorg.postgresql.disableExtraFloatDigits=true"

COPY build/libs/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Add JVM arg to prevent sending extra_float_digits (needed for PgBouncer)
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
