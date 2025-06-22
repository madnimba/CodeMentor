# Stage 1: Build the application
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy project files
COPY pom.xml .
COPY src ./src

# ✅ Install Maven
RUN apk add --no-cache maven

# Build the JAR file (skip tests for faster build)
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Use non-root user (optional but recommended)
RUN addgroup -S app && adduser -S app -G app
USER app

# Expose the default port
EXPOSE 8080

# Run the app (Java options optional)
CMD ["java", "-Xmx512m", "-Xms256m", "-XX:+UseG1GC", "-jar", "app.jar"]
