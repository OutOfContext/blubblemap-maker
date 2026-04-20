# ── Build-Stage ──────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
LABEL authors="rhueh"

WORKDIR /app

# Abhängigkeiten zuerst cachen (Layer-Cache)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Quellcode kopieren und bauen
COPY src ./src
RUN mvn package -DskipTests -q

# ── Runtime-Stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-alpine

WORKDIR /app

COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
