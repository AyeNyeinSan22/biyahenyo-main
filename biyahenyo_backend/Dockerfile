FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app
COPY build/libs/biyahenyo_backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
