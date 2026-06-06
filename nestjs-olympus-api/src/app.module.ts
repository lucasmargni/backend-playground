import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import KeyvRedis from '@keyv/redis';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import appConfig, { AppConfig } from './config/app.config.js';
import databaseConfig, { DatabaseConfig } from './config/database.config.js';
import { GodsModule } from './modules/gods/gods.module.js';
import { TitansModule } from './modules/titans/titans.module.js';
import { MythsModule } from './modules/myths/myths.module.js';
import { BeingsModule } from './modules/beings/beings.module.js';
import { ApiKeyGuard } from './common/guards/api-key.guard.js';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.get<DatabaseConfig>('database')!;
        return {
          type: 'postgres',
          url: db.url,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: { rejectUnauthorized: false },
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { redisUrl } = configService.get<AppConfig>('app')!;
        return {
          stores: [new KeyvRedis(redisUrl)],
          ttl: 60000,
        };
      },
    }),
    GodsModule,
    TitansModule,
    MythsModule,
    BeingsModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ApiKeyGuard }],
})
export class AppModule {}
