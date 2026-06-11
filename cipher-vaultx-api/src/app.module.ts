import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Vault } from './vaults/entities/vault.entity';
import { Secret } from './secrets/entities/secret.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CryptoModule } from './crypto/crypto.module';
import { VaultsModule } from './vaults/vaults.module';
import { SecretsModule } from './secrets/secrets.module';
import { VaultMembersModule } from './vault-members/vault-members.module';
import { VaultMember } from './vault-members/entities/vault-member.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        entities: [User, Vault, Secret, VaultMember],
        synchronize: false,
        migrations: ['dist/migrations/**/*.js'],
        migrationsRun: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CryptoModule,
    VaultsModule,
    SecretsModule,
    VaultMembersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
