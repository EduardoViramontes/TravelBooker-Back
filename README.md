# 📦 TravelBooker-Back

## 📋 Requisitos previos

Asegúrate de tener instalado lo siguiente en tu entorno de desarrollo:

* **Node.js** >= 18 (recomendado 20)
* **npm** o **yarn**
* **PostgreSQL** >= 13
* **Git**

---

## ⚙️ Configuración de variables de entorno

Crea un archivo `.env` en la raíz del proyecto basado en el archivo de ejemplo:

```bash
cp .env.example .env
```

Variables comunes:

```env
# App
NODE_ENV=development
PORT=3000

# Auth
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=1h

# Database
DB_USERNAME_DEVELOPMENT=user
DB_PASSWORD_DEVELOPMENT=password
DB_DATABASE_DEVELOPMENT=dataBase
DB_HOST_DEVELOPMENT=localhost
DB_PORT_DEVELOPMENT=5432
DB_DIALECT_DEVELOPMENT=postgres

DB_USERNAME_TEST=user
DB_PASSWORD_TEST=password
DB_DATABASE_TEST=dataBase
DB_HOST_TEST=localhost
DB_PORT_TEST=5432
DB_DIALECT_TEST=postgres

DB_USERNAME_PRODUCCTION=user
DB_PASSWORD_PRODUCCTION=password
DB_DATABASE_PRODUCCTION=dataBase
DB_HOST_PRODUCCTION=localhost
DB_PORT_PRODUCCTION=5432
DB_DIALECT_PRODUCCTION=postgres

```

> ⚠️ Ajusta los valores según tu entorno local.

---

## 📥 Instalación de dependencias

```bash
npm install
# o
yarn install
```

------

## 📜 Scripts disponibles

El proyecto expone los siguientes scripts para el ciclo de desarrollo:

```json
"scripts": {
  "start": "ts-node --max-old-space-size=16384 dist/index.js",
  "build": "tsc",
  "serve": "npm run build && node dist/index.js",
  "dev": "nodemon src/index.ts",
  "test": "jest --runInBand",
  "migrate": "sequelize-cli db:migrate --config src/config/sequelize.config.js",
  "migrate:create": "sequelize-cli migration:generate --config src/config/sequelize.config.js",
  "migrate:undo": "sequelize-cli db:migrate:undo --config src/config/sequelize.config.js",
  "seed:create": "sequelize-cli seed:generate --config src/config/sequelize.config.js",
  "seed:run": "sequelize-cli db:seed:all --config src/config/sequelize.config.js",
  "seed:undo": "sequelize-cli db:seed:undo:all --config src/config/sequelize.config.js"
}
```

---

## 🗄️ Migraciones y seeds

### Ejecutar migraciones

```bash
npm run migrate
```

### Crear una nueva migración

```bash
npm run migrate:create
```

### Crear una nueva migración con nombre

```bash
npm run migrate:create -- --name "NAME"
```

### Revertir la última migración

```bash
npm run migrate:undo
```

### Ejecutar seeds (datos iniciales)

```bash
npm run seed:run
```

### Crear un nuevo seed

```bash
npm run seed:create
```

### Crear un nuevo seed con nombre

```bash
npm run seed:create -- --name "NAME"
```

> Los seeds suelen crear usuarios base, roles y catálogos iniciales.

---

## 🚀 Levantar el proyecto

### Modo desarrollo

```bash
npm run dev
```

Utiliza **nodemon** para recargar automáticamente ante cambios.

### Build y ejecución (producción/local)

```bash
npm run serve
```

Compila el proyecto con TypeScript y ejecuta el código generado en `dist/`.

El servidor estará disponible en:

```
http://localhost:3000
```

---

## 🧪 Ejecución de pruebas

### Ejecutar pruebas unitarias

```bash
npm run test
```

Las pruebas se ejecutan con **Jest** en modo secuencial (`--runInBand`).


## 🏗️ Arquitectura del proyecto

El proyecto sigue una arquitectura **por capas y módulos**, orientada a mantener separación de responsabilidades:

```
migrations/
seeders/
src/
├── config/
├── controllers/
├── db/
│   └── models/
├── metrics/
├── middlewares/
├── routes/
├── services/
├── app.ts
└── index.ts
tests/

```

### Capas principales

* **Controllers**: Contienen la lógica de negocio..
* **Routes**: Manejan HTTP (request/response).
* **db / Models**: Acceso a datos (ORM).
* **Middlewares**: Autenticación, autorización, validaciones.
* **Services**: Funciones reutilizables.

---

## 🔐 Autenticación

La autenticación se implementó utilizando **JWT (JSON Web Tokens)**:

1. El usuario inicia sesión con credenciales válidas.
2. El backend genera un token JWT firmado.
3. El token se envía al cliente y se usa en el header:

```http
Authorization: Bearer <token>
```

4. Un middleware valida el token en cada request protegida.

Características:

* Tokens con expiración.
* Firma segura usando `JWT_SECRET`.

---

## 👥 Roles y permisos

El sistema utiliza **RBAC (Role-Based Access Control)**:

* **Roles** (ej. ADMIN, USER, MANAGER).
* **Permisos** asociados a cada rol.

Flujo:

1. El usuario tiene asignado uno o más roles.
2. Cada endpoint define el permiso requerido.
3. Un middleware valida el acceso antes de ejecutar el controlador.

Ejemplo:

```ts
ValidPermissions.valid("Users", "R")
GET /users
```

---

## 📄 Paginación y filtros

La paginación se maneja desde query params:

```http
GET /users?eliminados=false&orden=DESC&campoOrden=id&page=1&pageSize=10&busquedaLibre=
```

Respuesta típica:

```json
{
    "status": true,
    "currentPage": 1,
    "nextPage": null,
    "prevPage": null,
    "pages": 1,
    "total": 2,
    "data": [],

}
```

### Filtros

Los filtros se aplican dinámicamente desde los query params:

```http
GET /users?filter={"and":[{"property": "status","value": true,"operator": "=="}],"or":[]}
```

Esto permite búsquedas flexibles sin crear múltiples endpoints.

---

## 🧠 Decisiones de diseño

Algunas decisiones técnicas relevantes:

* **Arquitectura modular** para facilitar escalabilidad y mantenimiento.
* **Separación Controller / Service** para evitar lógica de negocio en rutas.
* **JWT stateless** para simplificar escalado horizontal.
* **PostgreSQL** por su robustez y soporte para datos relacionales complejos.
* **Migraciones versionadas** para control de cambios en base de datos.
* **Middlewares reutilizables** para seguridad y validaciones.

---

## 📌 Notas finales

* Revisar el archivo `.env.example` para todas las variables disponibles.
* Los comandos pueden variar ligeramente según el gestor de paquetes.
* Este README puede extenderse con diagramas o ejemplos de endpoints.

---

✍️ **Autor**: Eduardo Viramontes
