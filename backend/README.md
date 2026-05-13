# Breazelife Backend

API REST del proyecto Breazelife, construida con **Spring Boot**, **MySQL** y **Redis**.

---

## Estructura de carpetas

```
breazelife-backend/          ← directorio raíz (docker-compose y .env aquí)
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env                     ← variables para entorno de desarrollo
├── .env.prod                ← variables para entorno de producción
└── breazelife/              ← repositorio clonado (este proyecto)
    ├── src/
    ├── pom.xml
    ├── Dockerfile
    ├── Dockerfile.dev
    └── README.md
```

---

## Clonar el repositorio

El repositorio debe clonarse **dentro** del directorio `breazelife-backend/`:

```bash
mkdir breazelife-backend
cd breazelife-backend
git clone <url-del-repositorio> breazelife
```

---

## Ejecución con Docker (recomendado)

Los ficheros `docker-compose.yml`, `docker-compose.dev.yml` y `.env` deben estar en **`breazelife-backend/`**, es decir, un nivel por encima de la carpeta del repositorio, tal y como muestra la estructura anterior.

### Entorno de desarrollo

```bash
cd breazelife-backend
docker compose -f docker-compose.dev.yml --env-file .env up --build
```

El servidor arranca en `http://localhost:${PORT}`.

### Entorno de producción

```bash
cd breazelife-backend
docker compose -f docker-compose.yml --env-file .env.prod up --build -d
```

---

## Ejecución sin Docker (local)

Si no se usa Docker, las variables de entorno deben estar disponibles al lanzar la aplicación. La forma más sencilla es crear un fichero `.env` **dentro de la carpeta `breazelife/`** y exportar las variables antes de arrancar:

```bash
cd breazelife-backend/breazelife

# Exportar variables (Linux/macOS)
export $(cat .env | xargs)

./mvnw spring-boot:run
```

También se pueden configurar directamente en el IDE (IntelliJ → Run Configurations → Environment variables).

Asegúrate de tener MySQL y Redis corriendo localmente y de que los valores de `DB_HOST`, `DB_PORT`, `REDIS_HOST` y `REDIS_PORT` apunten a tus instancias locales (normalmente `localhost`).

---

## Variables de entorno

Crea un fichero `.env` tomando como base el siguiente ejemplo. Las variables marcadas con `*` son **obligatorias cambiar** antes de desplegar en producción.

```env
# ── Aplicación ────────────────────────────────────────
HOST=breazelife-app-dev      # Nombre del contenedor de la app
PORT=8000                    # Puerto expuesto en el host

# ── Base de datos (MySQL) ─────────────────────────────
DB_HOST=breazelife-db-dev    # Hostname del servicio de base de datos
DB_PORT=3306                 # Puerto de MySQL
DB_ROOT_PASSWORD=admin       # * Contraseña del usuario root de MySQL
DB_NAME=breazelife           # Nombre de la base de datos
DB_USER=admin                # Usuario de la base de datos
DB_PASSWORD=admin123         # * Contraseña del usuario de la base de datos

# ── Redis ─────────────────────────────────────────────
REDIS_HOST=breazelife-redis-dev  # Hostname del servicio Redis
REDIS_PORT=6379                  # Puerto de Redis
REDIS_PASSWORD=redispassword     # * Contraseña de Redis

# ── Seguridad ─────────────────────────────────────────
JWT_SECRET=mysecretkey       # * Clave secreta para firmar los tokens JWT
                             #   Usar una cadena larga y aleatoria en producción

# ── Email ─────────────────────────────────────────────
EMAIL_TOKEN=                 # * Token de acceso al servicio de envío de emails
```

### Descripción detallada

| Variable | Descripción |
|---|---|
| `HOST` | Nombre del contenedor Docker de la aplicación |
| `PORT` | Puerto del host mapeado al puerto interno `8080` de la app |
| `DB_HOST` | Hostname o nombre de servicio de MySQL (en Docker, el nombre del servicio) |
| `DB_PORT` | Puerto de MySQL (por defecto `3306`) |
| `DB_ROOT_PASSWORD` | Contraseña del usuario `root` de MySQL |
| `DB_NAME` | Nombre de la base de datos que utilizará la aplicación |
| `DB_USER` | Usuario de la base de datos con acceso a `DB_NAME` |
| `DB_PASSWORD` | Contraseña del usuario `DB_USER` |
| `REDIS_HOST` | Hostname o nombre de servicio de Redis |
| `REDIS_PORT` | Puerto de Redis (por defecto `6379`) |
| `REDIS_PASSWORD` | Contraseña requerida por Redis para autenticarse |
| `JWT_SECRET` | Clave usada para firmar y verificar los tokens JWT. Debe ser una cadena secreta, larga y aleatoria en producción |
| `EMAIL_TOKEN` | Token de autenticación del proveedor de email externo |
