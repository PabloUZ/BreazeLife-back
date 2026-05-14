# BreazeLife Monorepo

Monorepo que contiene el backend (Spring Boot) y el frontend (React Native / Expo) del proyecto BreazeLife.

## Estructura

```
BreazeLife-back/
├── backend/      # API REST - Spring Boot (Java)
└── frontend/     # App móvil - React Native (Expo)
```

## Proyectos

### Backend (`/backend`)
API REST construida con Spring Boot. Consulta [`backend/README.md`](backend/README.md) para instrucciones de configuración.

### Frontend (`/frontend`)
Aplicación móvil construida con React Native y Expo.

```bash
cd frontend
npx expo start
```

## Requisitos
- Java 17+
- Node.js 18+
- Expo CLI
