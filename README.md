# WeatherApp -- Authentication, Weather, and UI Services

## Overview

WeatherApp is composed of **three microservices** deployed on
Kubernetes:

1.  **Authentication Service**
    -   Handles user signup/login.

    -   Uses **MySQL** as backend database.

    -   Uses **JWT tokens** for authentication.

    -   JWT secret generated using:

            openssl rand -base64 32
2.  **Weather Service**
    -   Connects to **weatherapi.com** using an API key.
    -   Retrieves real‑time weather data for a given city.
3.  **UI Service**
    -   Frontend allowing users to sign up, log in, and search for
        weather.
    -   Communicates with Auth and Weather services through environment
        variables.

------------------------------------------------------------------------

## MySQL Stateful Deployment

The `auth/mysql/` directory contains: - A **StatefulSet** for MySQL. - A
**Job** to initialize the Auth database and user.

You must create the required Kubernetes secret:

``` bash
kubectl create secret generic mysql-secret   --from-literal=root-password='root123'   --from-literal=auth-password='auth1234'   --from-literal=secret-key='jwtsecret123'
```

This secret is mounted into the Authentication app so it can connect to
the DB and generate JWT tokens.

------------------------------------------------------------------------

## Weather API Secret

A second secret is required for the Weather service to authenticate
against weatherapi.com:

``` bash
kubectl create secret generic weatherapi-secret   --from-literal=api-key='YOUR_API_KEY'
```

------------------------------------------------------------------------

## Docker Build Instructions

Each service contains its own `Dockerfile`.

To build and push:

``` bash
docker build -t <your-dockerhub>/weatherapp-auth:latest auth/
docker build -t <your-dockerhub>/weatherapp-weather:latest weather/
docker build -t <your-dockerhub>/weatherapp-ui:latest ui/

docker push <your-dockerhub>/weatherapp-auth:latest
docker push <your-dockerhub>/weatherapp-weather:latest
docker push <your-dockerhub>/weatherapp-ui:latest
```

Then update the images in Kubernetes deployments:

``` bash
kubectl apply -f weather-app-manifests/auth/
kubectl apply -f weather-app-manifests/weather/
kubectl apply -f weather-app-manifests/ui/
```

------------------------------------------------------------------------

## Environment Variables in Deployments

### UI Deployment

    AUTH_HOST=http://weatherapp-auth.default.svc.cluster.local:3000
    WEATHER_HOST=http://weatherapp-service.default.svc.cluster.local:4000

### Weather Deployment

Uses weather API secret.

### Auth Deployment

Uses MySQL secret for: - MySQL root password - Auth user password - JWT
secret

------------------------------------------------------------------------

## Ingress

UI is exposed using Kubernetes Ingress, allowing browser access.

------------------------------------------------------------------------

## Final Notes

-   Ensure secrets are created **before** applying deployments.
-   Update Docker image names after building your custom images.
-   The application requires internet access to reach
    **weatherapi.com**.
