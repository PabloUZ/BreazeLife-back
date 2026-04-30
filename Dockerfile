FROM maven:3.9-amazoncorretto-25 AS build

WORKDIR /build

COPY pom.xml .
RUN mvn dependency:go-offline

COPY . .
RUN mvn clean package -Dmaven.test.skip=true

FROM amazoncorretto:25

WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

ENTRYPOINT ["java","-XX:+UseContainerSupport","-XX:MaxRAMPercentage=75.0","-XX:+UseG1GC","-jar","app.jar"]