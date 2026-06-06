# Olympus API

A REST API about Greek mythology built with NestJS, TypeORM, and PostgreSQL. Includes authentication with API Keys, Redis caching, full-text search, and pagination.

---

## Tech Stack

- **Node.js** + **TypeScript**
- **NestJS** — backend framework
- **TypeORM** — ORM and entity management
- **PostgreSQL** — relational database (hosted on [Neon](https://neon.tech))
- **Redis** — response caching (hosted on [Upstash](https://upstash.com))
- **API Keys** — authentication via custom Guard
- **Swagger / OpenAPI** — auto-generated API documentation

---

## Features

- Full CRUD for Gods, Titans, and Myths
- Single Table Inheritance — Gods and Titans share a `MythologicalBeing` base entity
- Family tree relationships — beings can have multiple parents and children
- Many-to-many relationships between Myths and MythologicalBeings
- API Key authentication protecting all write endpoints
- Redis caching on all read endpoints
- Full-text search across gods, titans, and myths with optional type filter
- Pagination on all list endpoints
- Auto-generated Swagger documentation at `/docs`

---

## Project Structure

```
nestjs-olympus-api/
├── src/
│   ├── common/
│   │   ├── decorators/
│   │   │   └── public.decorator.ts     # @Public() decorator for open endpoints
│   │   ├── dto/
│   │   │   └── pagination.dto.ts       # Shared pagination DTO
│   │   ├── guards/
│   │   │   └── api-key.guard.ts        # API Key authentication guard
│   │   └── interfaces/
│   │       └── paginated-response.interface.ts
│   ├── config/
│   │   ├── app.config.ts               # App and auth configuration
│   │   └── database.config.ts          # Database configuration
│   ├── modules/
│   │   ├── beings/
│   │   │   └── being.entity.ts         # Base entity with STI
│   │   ├── gods/
│   │   │   ├── dto/
│   │   │   ├── god.entity.ts
│   │   │   ├── gods.controller.ts
│   │   │   ├── gods.service.ts
│   │   │   └── gods.module.ts
│   │   ├── titans/
│   │   │   ├── dto/
│   │   │   ├── titan.entity.ts
│   │   │   ├── titans.controller.ts
│   │   │   ├── titans.service.ts
│   │   │   └── titans.module.ts
│   │   ├── myths/
│   │   │   ├── dto/
│   │   │   ├── myth.entity.ts
│   │   │   ├── myths.controller.ts
│   │   │   ├── myths.service.ts
│   │   │   └── myths.module.ts
│   │   └── search/
│   │       ├── dto/
│   │       ├── search.controller.ts
│   │       ├── search.service.ts
│   │       └── search.module.ts
│   ├── app.module.ts
│   └── main.ts
├── .env                                # Environment variables (not committed)
├── .env.example                        # Environment variables template
└── package.json
```

---

## Getting Started

### Requirements

- Node.js 20+
- A PostgreSQL database ([Neon](https://neon.tech) recommended)
- A Redis instance ([Upstash](https://upstash.com) recommended)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Running the Server

```bash
npm run start:dev     # development with watch mode
npm run start:prod    # production
```

The server will be available at `http://localhost:3000`.
Swagger documentation is available at `http://localhost:3000/docs`.

---

## Environment Variables

See `.env.example` for reference:

| Variable       | Description                                 |
| -------------- | ------------------------------------------- |
| `PORT`         | Port the server runs on (default: 3000)     |
| `NODE_ENV`     | Environment (`development` or `production`) |
| `DATABASE_URL` | PostgreSQL connection string                |
| `API_KEY`      | Secret key required for write endpoints     |
| `REDIS_URL`    | Redis connection string (`rediss://...`)    |

---

## Authentication

Write endpoints (`POST`, `PATCH`, `DELETE`) require an API Key sent in the request header:

```
x-api-key: your-api-key
```

Read endpoints (`GET`) are public and require no authentication.

---

## API Reference

Full interactive documentation is available at `http://localhost:3000/docs`.

### Gods

| Method | Endpoint                      | Auth | Description                |
| ------ | ----------------------------- | ---- | -------------------------- |
| GET    | `/gods`                       | ❌   | List all gods (paginated)  |
| GET    | `/gods/:id`                   | ❌   | Get a god by ID            |
| GET    | `/gods/:id/parents`           | ❌   | Get parents of a god       |
| GET    | `/gods/:id/children`          | ❌   | Get children of a god      |
| GET    | `/gods/:id/myths`             | ❌   | Get myths featuring a god  |
| POST   | `/gods`                       | ✅   | Create a god               |
| POST   | `/gods/:id/parents/:parentId` | ✅   | Add a parent to a god      |
| PATCH  | `/gods/:id`                   | ✅   | Update a god               |
| DELETE | `/gods/:id`                   | ✅   | Delete a god               |
| DELETE | `/gods/:id/parents/:parentId` | ✅   | Remove a parent from a god |

### Titans

| Method | Endpoint      | Auth | Description                 |
| ------ | ------------- | ---- | --------------------------- |
| GET    | `/titans`     | ❌   | List all titans (paginated) |
| GET    | `/titans/:id` | ❌   | Get a titan by ID           |
| POST   | `/titans`     | ✅   | Create a titan              |
| PATCH  | `/titans/:id` | ✅   | Update a titan              |
| DELETE | `/titans/:id` | ✅   | Delete a titan              |

### Myths

| Method | Endpoint                         | Auth | Description                    |
| ------ | -------------------------------- | ---- | ------------------------------ |
| GET    | `/myths`                         | ❌   | List all myths (paginated)     |
| GET    | `/myths/:id`                     | ❌   | Get a myth by ID               |
| POST   | `/myths`                         | ✅   | Create a myth                  |
| POST   | `/myths/:id/characters/:beingId` | ✅   | Add a character to a myth      |
| PATCH  | `/myths/:id`                     | ✅   | Update a myth                  |
| DELETE | `/myths/:id`                     | ✅   | Delete a myth                  |
| DELETE | `/myths/:id/characters/:beingId` | ✅   | Remove a character from a myth |

### Search

| Method | Endpoint                  | Auth | Description                 |
| ------ | ------------------------- | ---- | --------------------------- |
| GET    | `/search?q=zeus`          | ❌   | Search across all resources |
| GET    | `/search?q=zeus&type=god` | ❌   | Search filtered by type     |

---

## Request Examples

### Create a God

```http
POST /gods
x-api-key: your-api-key
Content-Type: application/json

{
  "name": "Zeus",
  "domain": "sky",
  "description": "King of the Olympian gods and ruler of Mount Olympus.",
  "symbol": "lightning bolt",
  "romanName": "Jupiter"
}
```

### Create a Titan

```http
POST /titans
x-api-key: your-api-key
Content-Type: application/json

{
  "name": "Kronos",
  "generation": "primordial",
  "description": "Titan ruler of the universe before the Olympians.",
  "symbol": "scythe",
  "romanName": "Saturn"
}
```

### Add a Parent to a God

```http
POST /gods/:godId/parents/:titanId
x-api-key: your-api-key
```

### Create a Myth

```http
POST /myths
x-api-key: your-api-key
Content-Type: application/json

{
  "title": "The Birth of Athena",
  "summary": "Zeus swallowed his pregnant consort Metis fearing a prophecy. Later, Hephaestus split Zeus's skull and Athena emerged fully grown and armored."
}
```

### Add a Character to a Myth

```http
POST /myths/:mythId/characters/:beingId
x-api-key: your-api-key
```

### List Gods with Pagination

```http
GET /gods?page=1&limit=10
```

### Search

```http
GET /search?q=zeus&type=god
```

---

## Technical Highlights

### Single Table Inheritance (STI)

Gods and Titans share a common `MythologicalBeing` base entity stored in a single `beings` table. A `type` column distinguishes between them. This allows family relationships (parents/children) to work across both types — a God can have a Titan as a parent without any extra complexity.

### API Key Authentication with Guards

Instead of JWT, this API uses API Keys via a custom NestJS `Guard`. The guard reads the `x-api-key` header and validates it against the configured key. A `@Public()` decorator marks endpoints that should bypass the guard, making it easy to control access at the method level.

### Redis Caching

All `GET` endpoints use `CacheInterceptor` from `@nestjs/cache-manager` backed by a Redis instance on Upstash. Responses are cached for 60 seconds, reducing database load on repeated reads.

### Full-Text Search

Search is implemented using PostgreSQL's native full-text search with `to_tsvector` and `plainto_tsquery`. A generic `searchInRepository` method handles the query builder logic and is reused across all resource types. Results from multiple resources are combined in parallel using `Promise.all`.

### Typed Configuration

All environment variables are validated at startup using a `required()` helper. If a critical variable is missing, the app throws a descriptive error and refuses to start. Each config namespace (`app`, `database`) is typed with a TypeScript interface for safe access throughout the codebase.
