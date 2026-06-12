# Security Architecture — cipher-vaultx-api

This document explains how security works across the entire project: how secrets are encrypted, how users prove who they are, how vaults are shared without ever exposing passwords, and which additional layers protect the API. Each section starts with a plain-language explanation, followed by the technical details.

The encryption core lives in `CryptoService` (`src/crypto/crypto.service.ts`), but security in this project is a combination of several layers working together.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Encryption Model](#2-encryption-model)
3. [Vault Sharing](#3-vault-sharing)
4. [Authentication](#4-authentication)
5. [Role-Based Permissions](#5-role-based-permissions)
6. [Audit Logging](#6-audit-logging)
7. [API Hardening](#7-api-hardening)
8. [Technical Reference](#8-technical-reference)

---

## 1. The Big Picture

**The analogy**: imagine a bank with safety deposit boxes.

- Each **vault** is a safety deposit box with a single physical key (the _vault key_).
- The bank never keeps that key hanging on a wall. Instead, each person with access keeps their own **copy of the key, locked inside a personal strongbox** that only opens with their personal password.
- Even the bank's employees (the server, the database administrators) cannot open any box — they only store locked strongboxes.

**In practice**: every secret value is encrypted before touching the database. The key that encrypts secrets (the vault key) is itself stored encrypted, once per member, using a key derived from each member's password. The server only handles plaintext keys in memory, for the duration of a single request.

What this guarantees:

- A database leak exposes only encrypted bytes.
- Nobody — including server administrators — can read secrets without a member's password.
- Sharing a vault never requires sharing a password.

---

## 2. Encryption Model

### 2.1 Encrypting data — AES-256-GCM

**The analogy**: AES-256-GCM is a lockbox that does two things at once: it locks the content (nobody can read it) and it seals the lid with a tamper-evident sticker (if anyone touches it, you'll know).

**The detail**: AES is a symmetric cipher — the same key encrypts and decrypts. The `256` is the key size in bits. `GCM` (Galois/Counter Mode) provides _authenticated encryption_: along with the ciphertext, it produces an **auth tag**. During decryption, if the ciphertext was modified by even a single bit, the auth tag check fails and decryption throws an explicit error instead of silently returning garbage. This is why GCM is preferred over older modes like CBC.

Every encryption operation produces three values, and all three are required to decrypt:

| Value       | What it is                                   |
| ----------- | -------------------------------------------- |
| `encrypted` | The ciphertext itself                        |
| `iv`        | A random 12-byte value, unique per operation |
| `authTag`   | A 16-byte integrity seal                     |

### 2.2 Why the IV exists

**The analogy**: if you wrote the same letter twice and sealed it the same way, anyone watching could tell both envelopes contain the same message. The IV is like adding a random doodle to each envelope so no two ever look alike.

**The detail**: without an IV, encrypting the same value twice with the same key produces identical ciphertext, leaking information about patterns in the data. With a random IV per operation, the same plaintext encrypts to different ciphertext every time. The IV is not secret — it is stored next to the ciphertext — but it must never be reused with the same key.

### 2.3 From password to key — PBKDF2

**The analogy**: a password like `MyP@ssw0rd` is a phrase a human can remember; an encryption key is a precise 32-byte machine part. PBKDF2 is an industrial grinder: whatever you feed it, the output always has the exact same shape — and the grinder is deliberately slow, so anyone trying millions of guesses pays a heavy price for each one.

**The detail**: PBKDF2 applies SHA-256 iteratively (100,000 times in this project) over the password plus a **salt**, producing a fixed 32-byte key (the _master key_). The iteration count makes brute-force attacks expensive: ~100ms per attempt is imperceptible for a legitimate user but devastating for an attacker testing millions of passwords.

### 2.4 The salt

**The analogy**: two people with the same password should still end up with different keys — the salt is a pinch of unique randomness added to each person's grinder.

**The detail**: the salt is 32 random bytes generated per vault membership. It prevents _rainbow table_ attacks (precomputed tables of common password hashes) and ensures two users with identical passwords derive different master keys. The salt is not secret and is stored in the database next to the encrypted key material.

### 2.5 The full encryption chain

Putting it together, this is what happens for each operation:

**Creating a vault** (`VaultsService.create` → `VaultMembersService.createOwner`):

1. Generate a random 32-byte salt.
2. Derive the master key: `PBKDF2(password, salt)`.
3. Generate a random 32-byte **vault key** — the key that will encrypt this vault's secrets.
4. Encrypt the vault key with the master key (AES-256-GCM).
5. Persist `encryptedKey`, `keyIv`, `keyAuthTag`, `salt` on the owner's `VaultMember` row. The plaintext vault key is discarded.

**Storing a secret** (`SecretsService.create`):

1. Decrypt the requesting member's copy of the vault key using their password.
2. Encrypt the secret value with the vault key.
3. Persist `encryptedValue`, `iv`, `authTag` on the `Secret` row. The plaintext value is discarded.

**Reading a secret** (`SecretsService.findOneAndDecrypt`):

1. Decrypt the member's copy of the vault key using their password.
2. Decrypt the secret with the vault key.
3. Return the plaintext value in the response — it is never written anywhere.

---

## 3. Vault Sharing

### 3.1 The problem

**The analogy**: you have a safety deposit box and want to give a friend access. You can't hand them your personal password, and the bank refuses to keep unlocked keys around. How does your friend get their own locked copy of the box key?

### 3.2 The solution — per-member key wrapping

Each member of a vault holds an **independent encrypted copy of the same vault key**, wrapped with a key derived from _their own_ password. The vault key itself never changes — only the wrapping differs per member.

Stored on each `VaultMember` row: `encryptedKey`, `keyIv`, `keyAuthTag`, `salt`, plus the member's `role`.

### 3.3 The invitation flow

Handing the key copy over requires a moment where the vault key exists outside any member's wrapping. This is solved with short-lived, single-use invitation tokens:

**Step 1 — The owner invites** (`POST /vaults/:id/invitations`):

1. The owner provides their own password and the invitee's email.
2. The server validates the requester is an `owner` and the invited role is not `owner`.
3. The vault key is decrypted with the owner's master key.
4. A random 32-byte token is generated.
5. The vault key is re-encrypted **using the token itself as the key**.
6. A `VaultInvitation` row is stored with the wrapped key, the token, the invitee, the role, and a 15-minute expiration.
7. The token is returned to the owner, who shares it with the invitee through a separate channel.

**Step 2 — The invitee accepts** (`POST /invitations/:token/accept`):

1. The invitee must be authenticated (JWT) — the server verifies the authenticated user matches `invitation.invitedUser`. The token alone is not enough.
2. Expiration is checked; expired invitations are deleted.
3. The vault key is unwrapped using the token.
4. The vault key is re-wrapped with a key derived from the **invitee's own password** and stored as a new `VaultMember`.
5. The invitation is deleted (single-use).

From this point, the invitee unlocks secrets with their own password, independent of the owner.

**Why this is safe**:

- No user's password is ever visible to another user.
- The token alone is useless without being authenticated as the specific invitee.
- Invitations expire in 15 minutes and self-destruct on use.
- The vault key in plaintext only ever exists in server memory during a single request.

---

## 4. Authentication

### 4.1 Passwords — bcrypt

**The analogy**: the server never keeps your password — it keeps a _fingerprint_ of it. You can check whether a finger matches the fingerprint, but you can't rebuild the finger from it.

**The detail**: login passwords are hashed with **bcrypt** (10 salt rounds) before persisting (`AuthService.register`). bcrypt embeds its own random salt per hash and is deliberately slow. On login, `bcrypt.compare` checks the candidate password against the hash.

Note that the same user password plays two roles via two different mechanisms:

- **bcrypt hash** → proves identity at login. One-way; never reversed.
- **PBKDF2 derivation** → produces the master key for unwrapping vault keys. Deterministic given the same salt; happens per-request and is never stored.

The `password` column also has `select: false` in the entity, so it is excluded from every query unless explicitly requested — making accidental exposure structurally impossible.

### 4.2 Sessions — JWT

After login, the server issues a **JWT** signed with `JWT_SECRET`, containing only the user's `id` and `email` (never the password). Protected endpoints require it in the `Authorization: Bearer` header. The `JwtStrategy` (Passport) validates the signature and loads the user; the `JwtGuard` rejects requests without a valid token.

Failed logins return a single generic message (`Invalid credentials`) whether the email doesn't exist or the password is wrong — revealing which one failed would tell an attacker which emails are registered.

---

## 5. Role-Based Permissions

Every vault membership has a role, checked at the service layer:

| Role     | Read secrets | Create secrets | Invite members | View audit logs |
| -------- | ------------ | -------------- | -------------- | --------------- |
| `owner`  | ✅           | ✅             | ✅             | ✅              |
| `editor` | ✅           | ✅             | ❌             | ❌              |
| `viewer` | ✅           | ❌             | ❌             | ❌              |

Access to any vault or secret always resolves through `VaultsService.findOneByUser`, which only returns data if the requesting user has a `VaultMember` row for that vault — in a single query. A user without membership receives a `404`, indistinguishable from a vault that doesn't exist (no information leak about which vault IDs are valid).

Inviting as `owner` is explicitly rejected — ownership is not transferable through invitations.

---

## 6. Audit Logging

**The analogy**: a security camera over the safety deposit boxes. It can't open anything, but it records who walked up to which box, when, and whether their key worked.

**The detail**: an append-only `audit_log` table records sensitive actions — vault creation, secret creation, secret unlocks (including **failed attempts**, e.g. wrong password), invitations, and acceptances.

Implementation highlights:

- A custom `@Audit(action, resourceType)` decorator tags endpoints; a global `AuditInterceptor` reads the metadata and writes the log after the handler succeeds or fails. Business logic stays clean — no logging code in services.
- `userId` is stored as a **plain column, not a foreign key**. If a user deletes their account, their audit trail survives — preventing the "create account → act → delete account" evasion pattern.
- Logs have no `UPDATE` path and no update timestamp — they are written once and never modified.
- Only vault `owner`s can query a vault's logs (`GET /vaults/:vaultId/secrets/audit-logs`).

---

## 7. API Hardening

Several additional layers protect the API surface:

**Input validation** (`class-validator` + global `ValidationPipe`): every DTO declares validation rules. `whitelist` strips undeclared properties, `forbidNonWhitelisted` rejects requests containing them. Registration enforces strong passwords (minimum 8 characters, uppercase, lowercase, number, and symbol). The login DTO deliberately does _not_ validate password length — error messages there would leak password policy to attackers.

**Rate limiting** (`@nestjs/throttler`): a global limit of 10 requests/minute per IP, tightened to **3/minute on `/auth/register` and `/auth/login`** — the prime brute-force targets. Exceeding the limit returns `429 Too Many Requests`.

**Security headers** (`helmet`): standard protective headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.) applied to every response, mitigating MIME sniffing, clickjacking, and related browser-level attacks.

**Sensitive data never in URLs**: passwords always travel in request bodies (hence `POST /unlock` instead of `GET`) — URLs end up in logs and browser history; bodies do not.

---

## 8. Technical Reference

### 8.1 Constants (`CryptoService`)

| Constant            | Value         | Rationale                                                              |
| ------------------- | ------------- | ---------------------------------------------------------------------- |
| `ALGORITHM`         | `aes-256-gcm` | Industry standard, NIST-approved authenticated encryption.             |
| `KEY_LENGTH`        | 32 bytes      | Required by AES-256 (256 bits).                                        |
| `IV_LENGTH`         | 12 bytes      | NIST recommendation for GCM.                                           |
| `AUTH_TAG_LENGTH`   | 16 bytes      | Maximum forgery resistance for GCM.                                    |
| `PBKDF2_ITERATIONS` | 100,000       | ~100ms per derivation on modern hardware; prohibitive for brute force. |
| `PBKDF2_DIGEST`     | `sha256`      | Current standard; SHA-1 is deprecated for this use.                    |
| `SALT_LENGTH`       | 32 bytes      | 256 bits of entropy; defeats rainbow tables.                           |

### 8.2 CryptoService API

**Low-level (private/internal)**

| Method                                 | Purpose                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `deriveKey(password, salt)`            | PBKDF2 derivation: password → 32-byte master key.                                   |
| `encrypt(data, key)`                   | AES-256-GCM encryption. Generates a fresh IV. Returns `{ encrypted, iv, authTag }`. |
| `decrypt(encrypted, key, iv, authTag)` | AES-256-GCM decryption. Throws on auth tag mismatch.                                |

**High-level (public API)**

| Method                                                       | Purpose                                                                                                   |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `generateVaultKey(password)`                                 | Creates a new random vault key and wraps it with the password's derived key. Returns key material + salt. |
| `wrapVaultKey(vaultKey, password)`                           | Wraps an _existing_ vault key for a new member (sharing).                                                 |
| `decryptVaultKey(encryptedKey, iv, authTag, password, salt)` | Recovers the plaintext vault key for one request.                                                         |
| `encryptSecret(value, vaultKey)`                             | Encrypts a secret string.                                                                                 |
| `decryptSecret(encrypted, iv, authTag, vaultKey)`            | Decrypts a secret back to a string.                                                                       |
| `generateToken()`                                            | Random 32-byte hex token for invitations.                                                                 |

### 8.3 Shared types (`src/common/types`)

```typescript
export type EncryptResponse = {
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
};

export type VaultKeyResponse = EncryptResponse & { salt: Buffer };
```

### 8.4 Security properties summary

1. No plaintext secret or vault key is ever persisted.
2. Master keys are derived per request and discarded — never stored.
3. Each member's key copy is independent; revoking one does not affect others.
4. Every ciphertext is integrity-protected (GCM auth tag).
5. Each encryption uses a unique IV — identical plaintexts produce different ciphertexts.
6. Audit records survive user deletion and cannot be modified.
7. Auth endpoints are rate-limited and reveal nothing about which credential failed.

### 8.5 Possible future improvements

- **Asymmetric key sharing**: per-user RSA/ECC key pairs would let owners encrypt vault keys directly with an invitee's public key, eliminating the temporary token step.
- **Key rotation**: re-encrypting a vault's secrets under a new vault key after revoking a member.
- **Async PBKDF2**: the current implementation uses `pbkdf2Sync`; the async variant would avoid blocking the event loop under heavy concurrency.

---

## References

- [NIST SP 800-38D — GCM Mode](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [NIST SP 800-132 — PBKDF2 Recommendations](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
