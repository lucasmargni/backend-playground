import { Injectable } from '@nestjs/common';
import { EncryptResponse, VaultKeyResponse } from '../common/types';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32; /* bytes */
  private readonly IV_LENGTH = 12; /* bytes (recommended for GCM) */
  private readonly AUTH_TAG_LENGTH = 16; /* bytes */
  private readonly PBKDF2_ITERATIONS = 100_000;
  private readonly PBKDF2_DIGEST = 'sha256';
  private readonly SALT_LENGTH = 32; /* bytes */

  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.PBKDF2_ITERATIONS,
      this.KEY_LENGTH,
      this.PBKDF2_DIGEST,
    );
  }

  encrypt(data: Buffer, key: Buffer): EncryptResponse {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const cipherData = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return { encrypted: cipherData, iv, authTag };
  }

  decrypt(encrypted: Buffer, key: Buffer, iv: Buffer, authTag: Buffer): Buffer {
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decipherData = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decipherData;
  }

  generateVaultKey(password: string): VaultKeyResponse {
    const vaultKey = crypto.randomBytes(this.KEY_LENGTH);

    return this.wrapVaultKey(vaultKey, password);
  }

  decryptVaultKey(
    encryptedKey: Buffer,
    iv: Buffer,
    authTag: Buffer,
    password: string,
    salt: Buffer,
  ): Buffer {
    const masterKey = this.deriveKey(password, salt);
    const decrypted = this.decrypt(encryptedKey, masterKey, iv, authTag);

    return decrypted;
  }

  encryptSecret(value: string, vaultKey: Buffer): EncryptResponse {
    const bufferValue = Buffer.from(value, 'utf-8');
    const encrypted = this.encrypt(bufferValue, vaultKey);

    return encrypted;
  }

  decryptSecret(
    encrypted: Buffer,
    iv: Buffer,
    authTag: Buffer,
    vaultKey: Buffer,
  ): string {
    const decrypted = this.decrypt(encrypted, vaultKey, iv, authTag);
    const value = decrypted.toString('utf-8');

    return value;
  }

  wrapVaultKey(vaultKey: Buffer, password: string): VaultKeyResponse {
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const masterKey = this.deriveKey(password, salt);
    const encrypted = this.encrypt(vaultKey, masterKey);

    return { ...encrypted, salt };
  }
}
