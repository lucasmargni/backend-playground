import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig, { DatabaseConfig } from './config/database.config';
import { GodsModule } from './modules/gods/gods.module';
import { TitansModule } from './modules/titans/titans.module';

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
    GodsModule,
    TitansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
