# Crypto Engine — Technical Documentation

## Overview

The `CryptoService` (`src/crypto/crypto.service.ts`) is the cryptographic core of cipher-vaultx-api. It provides symmetric encryption and key derivation operations using industry-standard algorithms. The service is intentionally domain-agnostic — it doesn't know about vaults or secrets, only data encryption and decryption.

## Architecture

```
CryptoService (Public API)
├── generateVaultKey(password) → VaultKeyResponse
├── decryptVaultKey(encryptedKey, iv, authTag, password, salt) → Buffer
├── encryptSecret(value, vaultKey) → EncryptResponse
├── decryptSecret(encrypted, iv, authTag, vaultKey) → string
└── Private Methods
    ├── deriveKey(password, salt) → Buffer
    ├── encrypt(data, key) → EncryptResponse
    └── decrypt(encrypted, key, iv, authTag) → Buffer
```

## Algorithms

### AES-256-GCM

**Algorithm**: `aes-256-gcm` (Node.js `crypto` module)

- **256**: Key size in bits. Computationally infeasible to break via brute force with current technology.
- **GCM** (Galois/Counter Mode): Authenticated encryption. Combines confidentiality (encryption) and authenticity (integrity verification) in a single operation.

**Why GCM over CBC**:

- CBC encrypts but doesn't authenticate. Tampered ciphertext decrypts silently to garbage.
- GCM produces an auth tag that's verified during decryption. Tampering causes explicit decryption failure.

### Key Derivation: PBKDF2

**Function**: `crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest)`

- **Iterations**: 100,000 (NIST recommends minimum 10,000; this provides ~100ms derivation time per operation)
- **Hash Algorithm**: SHA-256
- **Output Length**: 32 bytes (256 bits for AES-256)

**Purpose**: Converts user passwords into cryptographic keys of fixed length. The iterative application makes brute-force attacks computationally prohibitive.

### Salt

**Length**: 32 bytes (256 bits of entropy)

- Prevents rainbow table attacks. Each vault has a unique salt.
- Makes two users with the same password have different master keys.
- Not secret — stored with the vault in the database.

## Data Flow

### Vault Creation

1. Generate random salt (32 bytes)
2. Derive master key: `PBKDF2(password, salt, 100k iterations, 32 bytes)`
3. Generate random vault key (32 bytes)
4. Encrypt vault key: `AES-256-GCM(vaultKey, masterKey)` → returns `{ encrypted, iv, authTag }`
5. Persist: `encryptedKey`, `keyIv`, `keyAuthTag`, `salt`
6. Vault key in plaintext is never persisted

### Secret Encryption

1. Retrieve vault key by decrypting: `AES-256-GCM-decrypt(encryptedKey, masterKey, keyIv, keyAuthTag)`
2. Convert secret value (string) to Buffer (UTF-8)
3. Encrypt: `AES-256-GCM(secretBuffer, vaultKey)` → returns `{ encrypted, iv, authTag }`
4. Persist: `encryptedValue`, `iv`, `authTag`

### Secret Decryption

1. Derive master key: `PBKDF2(password, salt, 100k iterations, 32 bytes)`
2. Decrypt vault key: `AES-256-GCM-decrypt(encryptedKey, masterKey, keyIv, keyAuthTag)`
3. Decrypt secret: `AES-256-GCM-decrypt(encryptedValue, vaultKey, iv, authTag)`
4. Convert Buffer (UTF-8) to string and return

## Constants

| Constant            | Value         | Rationale                                                                         |
| ------------------- | ------------- | --------------------------------------------------------------------------------- |
| `ALGORITHM`         | `aes-256-gcm` | Industry standard. NIST-approved.                                                 |
| `KEY_LENGTH`        | 32 bytes      | Required by AES-256 (256 bits).                                                   |
| `IV_LENGTH`         | 12 bytes      | NIST recommendation for GCM. Minimizes computational overhead.                    |
| `AUTH_TAG_LENGTH`   | 16 bytes      | Maximum forgery resistance for GCM.                                               |
| `PBKDF2_ITERATIONS` | 100,000       | Balance between security and performance. Modern hardware: ~100ms per derivation. |
| `PBKDF2_DIGEST`     | `sha256`      | Current standard. SHA-1 is deprecated for this use case.                          |
| `SALT_LENGTH`       | 32 bytes      | 256 bits of entropy. Makes rainbow table attacks impractical.                     |

## API Reference

### Public Methods

#### `generateVaultKey(password: string): VaultKeyResponse`

Generates encryption material for a new vault.

**Returns**:

```typescript
{
  encrypted: Buffer; // Encrypted vault key
  iv: Buffer; // Initialization vector (12 bytes)
  authTag: Buffer; // Authentication tag (16 bytes)
  salt: Buffer; // PBKDF2 salt (32 bytes) — store with vault
}
```

**Security**: The plaintext vault key exists only in memory during this operation and is immediately discarded.

---

#### `decryptVaultKey(encryptedKey: Buffer, iv: Buffer, authTag: Buffer, password: string, salt: Buffer): Buffer`

Recovers the plaintext vault key. Used before encrypting/decrypting secrets.

**Throws**: `Error` if auth tag verification fails (corrupted or tampered data).

**Returns**: Plaintext vault key (32 bytes). Valid only for this operation; not persisted.

---

#### `encryptSecret(value: string, vaultKey: Buffer): EncryptResponse`

Encrypts a secret value.

**Parameters**:

- `value`: Secret plaintext (any string)
- `vaultKey`: The vault's encryption key (32 bytes from `decryptVaultKey`)

**Returns**:

```typescript
{
  encrypted: Buffer; // Ciphertext
  iv: Buffer; // Unique IV (12 bytes) — different for each encryption
  authTag: Buffer; // Authentication tag (16 bytes)
}
```

**Note**: Each call generates a unique IV, so encrypting the same value twice produces different ciphertexts.

---

#### `decryptSecret(encrypted: Buffer, iv: Buffer, authTag: Buffer, vaultKey: Buffer): string`

Decrypts a secret value.

**Throws**: `Error` if auth tag verification fails.

**Returns**: Plaintext secret (string, UTF-8 decoded).

---

### Private Methods (Infrastructure)

#### `deriveKey(password: string, salt: Buffer): Buffer`

Derives a cryptographic key from a password using PBKDF2.

**Implementation**:

```
SHA-256(password + salt) applied 100,000 times
Output: 32 bytes (256 bits for AES-256)
```

**Note**: This is a synchronous operation. For high-throughput scenarios, consider `pbkdf2` (async) instead.

---

#### `encrypt(data: Buffer, key: Buffer): EncryptResponse`

Low-level AES-256-GCM encryption. Used internally by `generateVaultKey` and `encryptSecret`.

---

#### `decrypt(encrypted: Buffer, key: Buffer, iv: Buffer, authTag: Buffer): Buffer`

Low-level AES-256-GCM decryption. Used internally by `decryptVaultKey` and `decryptSecret`.

---

## Types

### EncryptResponse

```typescript
export type EncryptResponse = {
  encrypted: Buffer; // Ciphertext (variable length)
  iv: Buffer; // Initialization vector (12 bytes)
  authTag: Buffer; // Authentication tag (16 bytes)
};
```

All three values are required for decryption. The IV and auth tag are not secret.

---

### VaultKeyResponse

```typescript
export type VaultKeyResponse = EncryptResponse & {
  salt: Buffer; // PBKDF2 salt (32 bytes)
};
```

Extended `EncryptResponse` specific to vault key generation. The salt must be persisted with the vault to enable future key derivation.

---

## Security Properties

1. **No plaintext persistence**: Vault keys and secrets are never stored in plaintext. Only encrypted values touch the database.
2. **Authenticated encryption**: GCM's auth tag detects any tampering, corruption, or modification of ciphertext.
3. **Unique per operation**: Each encryption generates a unique IV, preventing pattern leakage.
4. **Unique per vault**: Each vault has its own salt and vault key, isolated from others.
5. **Password-based**: No server-side secret. Master keys derive from user passwords using PBKDF2.
6. **Forward secrecy**: If a vault key is compromised, only that vault's secrets are at risk.

---

## Usage Example

```typescript
import { CryptoService } from './crypto/crypto.service';

@Injectable()
export class VaultsService {
  constructor(private readonly cryptoService: CryptoService) {}

  // Create a vault
  async createVault(userId: string, vaultName: string, userPassword: string) {
    const vaultKeyMaterial = this.cryptoService.generateVaultKey(userPassword);

    await this.vaultsRepository.save({
      userId,
      name: vaultName,
      encryptedKey: vaultKeyMaterial.encrypted,
      keyIv: vaultKeyMaterial.iv,
      keyAuthTag: vaultKeyMaterial.authTag,
      salt: vaultKeyMaterial.salt,
    });
  }

  // Store a secret
  async createSecret(vault: Vault, secretValue: string, userPassword: string) {
    // Decrypt vault key
    const vaultKey = this.cryptoService.decryptVaultKey(
      vault.encryptedKey,
      vault.keyIv,
      vault.keyAuthTag,
      userPassword,
      vault.salt,
    );

    // Encrypt secret
    const encrypted = this.cryptoService.encryptSecret(secretValue, vaultKey);

    await this.secretsRepository.save({
      vault,
      encryptedValue: encrypted.encrypted,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    });
  }

  // Retrieve a secret
  async getSecret(secret: Secret, userPassword: string): Promise<string> {
    const vault = secret.vault;
    const vaultKey = this.cryptoService.decryptVaultKey(
      vault.encryptedKey,
      vault.keyIv,
      vault.keyAuthTag,
      userPassword,
      vault.salt,
    );

    return this.cryptoService.decryptSecret(
      secret.encryptedValue,
      secret.iv,
      secret.authTag,
      vaultKey,
    );
  }
}
```

---

## Module Configuration

`CryptoModule` is decorated with `@Global()`, making `CryptoService` available throughout the application without explicit imports. Register it once in `AppModule`:

```typescript
@Module({
  imports: [CryptoModule],
})
export class AppModule {}
```

Any service can then inject `CryptoService` directly:

```typescript
constructor(private readonly cryptoService: CryptoService) {}
```

---

## Implementation Notes

- All cryptographic operations are provided by Node.js's native `crypto` module (no external libraries).
- PBKDF2 uses synchronous iteration. For applications handling thousands of concurrent requests, consider the asynchronous variant.
- Buffers are used exclusively for binary data to avoid encoding issues.
- UTF-8 encoding is used for string/Buffer conversions (standard for web applications).

---

## References

- [NIST Special Publication 800-38D — GCM Mode](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [RFC 5116 — PBKDF2](https://tools.ietf.org/html/rfc5116)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)
