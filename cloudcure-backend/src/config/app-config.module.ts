import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Removed envFilePath: 'envs/.env.development' so prod ENV vars work on Render.
      // NestJS ConfigModule automatically falls back to process.env
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule { }
