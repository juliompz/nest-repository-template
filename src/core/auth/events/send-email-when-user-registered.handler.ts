import { EventHandlerInterface } from 'src/core/@shared/events/event.handler.interface';
import { UserRegisteredEvent } from './user-registered.event';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from 'src/redis/redis.service';

export class SendEmailWhenUserRegisteredHandler
  implements EventHandlerInterface<UserRegisteredEvent>
{
  constructor(
    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitmqClient: ClientProxy,

    private readonly redisService: RedisService,
  ) {}
  async handle(event: UserRegisteredEvent): Promise<void> {
    const { subject, to, username } = event.eventData;
    const code = this.generateCode();

    await this.redisService.set(code, to, 60 * 3); // 3 minutos
    this.rabbitmqClient.emit('email_send', {
      to: to,
      subject: subject,
      html: `
        <div style="max-width: 480px; margin: 40px auto; font-family: Arial, Helvetica, sans-serif; background: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
          <div style="text-align: center;">
            <img src="https://cdn-icons-png.flaticon.com/512/18831/18831913.png" alt="Logo" width="64" style="margin-bottom: 16px;" />
            <h1 style="color: #2d3748; font-size: 1.8rem; margin-bottom: 8px;">Bem-vindo ao sistema!</h1>
            <p style="color: #4a5568; font-size: 1rem; margin-bottom: 24px;">
              Olá ${username}, para confirmar seu cadastro, utilize o código abaixo:
            </p>
            <div style="display: inline-block; background: #edf2f7; border-radius: 6px; padding: 18px 32px; margin-bottom: 20px;">
              <span style="font-size: 2.2rem; letter-spacing: 6px; color: #3182ce; font-weight: bold;">${code}</span>
            </div>
            <p style="color: #718096; font-size: 0.95rem; margin-top: 18px;">
              Este código expira em <strong>3 minutos</strong>.
            </p>
          </div>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;">
          <div style="text-align: center; color: #a0aec0; font-size: 0.85rem;">
            Se você não solicitou este cadastro, ignore este e-mail.
          </div>
        </div>
      `,
    });
  }

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
