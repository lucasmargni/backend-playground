# cipher-vaultx-api

A secure secrets manager API built with NestJS, TypeORM, and PostgreSQL. Implements end-to-end encryption with AES-256-GCM and PBKDF2, per-user key wrapping for secure vault sharing, audit logging, and a full hardening layer.

---

## Tech Stack

- **Node.js** + **TypeScript** (strict mode)
- **NestJS** — backend framework
- **TypeORM** — ORM, entities, and migrations
- **PostgreSQL** — relational database
- **Node.js Crypto** — AES-256-GCM encryption and PBKDF2 key derivation
- **JWT** + **Passport** — authentication
- **bcrypt** — password hashing
- **class-validator** — request validation
- **@nestjs/throttler** — rate limiting
- **helmet** — security headers
- **Swagger / OpenAPI** — auto-generated API documentation

---

## Features

- User registration and login with JWT authentication
- Vault creation with per-vault encryption keys (AES-256-GCM)
- Encrypted secret storage — values are never persisted in plaintext
- Vault sharing via time-limited invitation tokens, with independent key copies per member
- Role-based permissions per vault (`owner`, `editor`, `viewer`)
- Append-only audit log for sensitive actions (vault/secret creation, secret unlocks, invitations)
- Request validation, rate limiting, and security headers
- Auto-generated Swagger documentation at `/api`

---

## Project Structure

```
cipher-vaultx-api/
├── docs/
│   └── CRYPTO_ENGINE.md       # Detailed documentation of the encryption model
├── src/
│   ├── audit/
│   │   ├── decorators/
│   │   │   └── audit.decorator.ts     # @Audit() decorator
│   │   ├── entities/
│   │   │   ├── audit-log.entity.ts
│   │   │   ├── audit-action.enum.ts
│   │   │   └── audit-resource-type.enum.ts
│   │   ├── audit.interceptor.ts       # Global interceptor that writes audit logs
│   │   ├── audit.service.ts
│   │   └── audit.module.ts
│   ├── auth/
│   │   ├── dto/
│   │   ├── guards/
│   │   │   └── jwt.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── crypto/
│   │   ├── crypto.service.ts          # AES-256-GCM, PBKDF2, key wrapping
│   │   └── crypto.module.ts           # Global module
│   ├── users/
│   │   ├── entities/
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── vaults/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── vault.entity.ts
│   │   ├── vaults.controller.ts
│   │   ├── vaults.service.ts
│   │   └── vaults.module.ts
│   ├── vault-members/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── vault-member.entity.ts
│   │   │   ├── vault-invitation.entity.ts
│   │   │   └── vault-role.enum.ts
│   │   ├── vault-members.controller.ts
│   │   ├── vault-members.service.ts
│   │   └── vault-members.module.ts
│   ├── secrets/
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── secret.entity.ts
│   │   ├── secrets.controller.ts
│   │   ├── secrets.service.ts
│   │   └── secrets.module.ts
│   ├── common/
│   │   └── types/
│   │       └── index.ts               # Shared types (EncryptResponse, VaultAccess, etc.)
│   ├── types/
│   │   └── express.d.ts               # Express Request augmentation
│   ├── migrations/
│   ├── database/
│   │   └── data-source.ts             # TypeORM CLI data source
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml      # PostgreSQL container
├── .env                    # Environment variables (not committed)
├── .env.example            # Environment variables template
└── package.json
```

---

## Getting Started

### Requirements

- Node.js 20+
- Docker (for running PostgreSQL locally)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

To generate a secure `JWT_SECRET`, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Setup

Start the PostgreSQL container:

```bash
sudo docker compose up -d
```

Run migrations to create the database schema:

```bash
npm run migration:run
```

### Running the Server

```bash
npm run start:dev     # development with watch mode
npm run start:prod    # production
```

The server will be available at `http://localhost:3000`.
Swagger documentation is available at `http://localhost:3000/api`.

---

## Environment Variables

See `.env.example` for reference:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

| Variable         | Description                                   |
| ---------------- | --------------------------------------------- |
| `PORT`           | Port the server runs on (default: 3000)       |
| `DATABASE_URL`   | PostgreSQL connection string                  |
| `JWT_SECRET`     | Secret key used to sign and verify JWT tokens |
| `JWT_EXPIRES_IN` | JWT expiration window (e.g. `7d`)             |

---

## Authentication

All endpoints except `/auth/register` and `/auth/login` require a JWT sent in the `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

`/auth/register` and `/auth/login` are rate-limited to 3 requests per minute per IP.

---

## Security Considerations

Every secret value, and every vault encryption key, is encrypted with **AES-256-GCM** before being persisted. No plaintext secret ever touches the database.

- Each **vault** has its own randomly generated encryption key (the "vault key").
- Each **member** of a vault holds an independent encrypted copy of the vault key, wrapped with a key derived from _their own_ password via **PBKDF2** (100,000 iterations, SHA-256, unique salt per member).
- Sharing a vault re-wraps the existing vault key for the new member — it never decrypts to plaintext outside of a single request's memory.
- Sharing uses short-lived, single-use invitation tokens. The vault key is temporarily wrapped with the token itself and discarded once the invitation is accepted or expires.
- All sensitive actions (vault/secret creation, secret unlocks, invitations, invitation acceptance) are recorded in an append-only audit log, including failed attempts.

For a full breakdown of the encryption flow, algorithms, and the `CryptoService` API, see [`docs/SECURITY.md`](./docs/SECURITY.md).

---

## API Reference

Full interactive documentation is available at `http://localhost:3000/api`.

### Auth

| Method | Endpoint         | Auth | Description                                     |
| ------ | ---------------- | ---- | ----------------------------------------------- |
| POST   | `/auth/register` | ❌   | Register a new user and receive an access token |
| POST   | `/auth/login`    | ❌   | Login and receive an access token               |

### Vaults

| Method | Endpoint                  | Auth | Description                                 |
| ------ | ------------------------- | ---- | ------------------------------------------- |
| GET    | `/vaults`                 | ✅   | List all vaults the user has access to      |
| GET    | `/vaults/:id`             | ✅   | Get vault details and the user's role       |
| POST   | `/vaults`                 | ✅   | Create a new vault (becomes owner)          |
| POST   | `/vaults/:id/invitations` | ✅   | Invite another user to a vault (owner only) |

### Secrets

| Method | Endpoint                              | Auth | Description                                        |
| ------ | ------------------------------------- | ---- | -------------------------------------------------- |
| GET    | `/vaults/:vaultId/secrets`            | ✅   | List secrets in a vault (without decrypted values) |
| GET    | `/vaults/:vaultId/secrets/audit-logs` | ✅   | Get audit logs for a vault (owner only)            |
| POST   | `/vaults/:vaultId/secrets`            | ✅   | Create and encrypt a new secret                    |
| POST   | `/vaults/:vaultId/secrets/:id/unlock` | ✅   | Decrypt and retrieve a secret value                |

### Invitations

| Method | Endpoint                     | Auth | Description               |
| ------ | ---------------------------- | ---- | ------------------------- |
| POST   | `/invitations/:token/accept` | ✅   | Accept a vault invitation |

---

## Request Examples

Add the following header to all protected requests:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "username": "lucass",
  "email": "lucas@example.com",
  "password": "MyP@ssw0rd"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "lucas@example.com",
  "password": "MyP@ssw0rd"
}
```

### Create a Vault

```http
POST /vaults
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "SuperSecretVault",
  "password": "MyP@ssw0rd"
}
```

### Create a Secret

```http
POST /vaults/:vaultId/secrets
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "MySuperSecret",
  "description": "The secret nobody must know",
  "value": "I am Batman",
  "password": "MyP@ssw0rd"
}
```

### Unlock a Secret

```http
POST /vaults/:vaultId/secrets/:id/unlock
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "password": "MyP@ssw0rd"
}
```

---

### Sharing a Vault

Sharing is a two-step flow: the owner creates an invitation, and the invited user accepts it with their own password.

**1. Owner creates an invitation**

```http
POST /vaults/:vaultId/invitations
Authorization: Bearer OWNER_TOKEN_HERE
Content-Type: application/json

{
  "email": "newmember@example.com",
  "password": "OWNER_PASSWORD",
  "role": "editor"
}
```

Response:

```json
{
  "token": "a1b2c3d4..."
}
```

The owner shares this token with the invited user through a separate channel.

**2. Invited user accepts the invitation**

```http
POST /invitations/:token/accept
Authorization: Bearer INVITED_USER_TOKEN_HERE
Content-Type: application/json

{
  "password": "INVITED_USER_PASSWORD"
}
```

From this point on, the invited user can access the vault's secrets using their **own** password — the server re-encrypts a copy of the vault key specifically for them during this step.

---

## Technical Highlights

### Per-Member Key Wrapping

Rather than storing a single encrypted vault key, each `VaultMember` holds its own copy of the vault key, wrapped (encrypted) with a key derived from that member's password. The underlying vault key never changes — only the wrapping does. This allows secure sharing without requiring users to share passwords, and access can be revoked per-member without re-encrypting any secrets.

### Token-Based Invitations

Sharing a vault is split into two steps to avoid ever exposing one user's password to another. The owner's request decrypts the vault key and re-wraps it with a randomly generated token. The invited user then proves their identity (JWT) and provides their own password in a separate request, at which point the vault key is unwrapped from the token and re-wrapped with the invited user's derived key. Invitations expire after 15 minutes and are single-use.

### Audit Logging via Interceptor

Sensitive actions are logged through a global `AuditInterceptor` combined with an `@Audit()` decorator, keeping audit concerns out of business logic entirely. The interceptor captures both successful operations and failures (e.g. wrong password on unlock), recording `userId`, `action`, `resourceType`, `resourceId`, and `success`. Logs are append-only and `userId` is stored as a plain field (not a foreign key) so records persist even if a user account is deleted.

### Resource-Scoped Access Control

Every vault and secret operation resolves access through `VaultsService.findOneByUser`, which returns both the `Vault` and the requesting user's `VaultMember` in a single query. This guarantees that no vault or secret data is loaded into memory unless the requesting user has a valid membership, and makes the member's role immediately available for permission checks (e.g. blocking `viewer`s from creating secrets).

### Strict TypeScript Throughout

The project runs with `strict: true`, `noImplicitAny`, `strictNullChecks`, and `strictBindCallApply` enabled from the start. All cryptographic buffers, DTOs, and shared response shapes are explicitly typed in `src/common/types`.

---

## Possible Extensions

- **Asymmetric key sharing**: replace the token-based invitation flow with public/private key pairs per user, so vault keys can be encrypted directly with a recipient's public key — removing the need for a temporary shared-token step entirely.
- **Member removal and key rotation**: allow owners to revoke a member's access and rotate the vault key for remaining members.
- **Secret versioning**: keep an encrypted history of previous secret values.
