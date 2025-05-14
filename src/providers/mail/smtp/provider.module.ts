import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

// Nota: En una aplicación real, deberías crear un módulo de configuración para el correo

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'smtp.example.com',
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: process.env.MAIL_SECURE === 'true',
        auth: {
          user: process.env.MAIL_USER || 'user@example.com',
          pass: process.env.MAIL_PASSWORD || 'password',
        },
      },
      defaults: {
        from: process.env.MAIL_FROM || '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(process.cwd(), 'templates', 'email'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  exports: [MailerModule],
})
export class SmtpMailProviderModule {}
