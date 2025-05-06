import { createTransport } from 'nodemailer';
import { fromString } from 'html-to-text';
import { Account } from '../auth/account.entity';

interface IEmail {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class Email {
  private readonly to: string;
  private readonly username: string;
  private readonly url: string;
  private readonly from: string;

  constructor(account: Account, url: string) {
    this.to = account.reg_mail;
    this.username = account.username;
    this.url = url;
    this.from = process.env.MAIL_FROM;
  }

  private static newTransport(mailOptions: IEmail) {
    return createTransport({
      host: process.env.MAIL_HOST,
      port: +process.env.MAIL_PORT,
      secure:false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Por si Gmail requiere (opcional, pero seguro evitar problemas)
      },
    }).sendMail(mailOptions);
  }

  private async send(template: string, subject: string): Promise<void> {
    const mailOptions: IEmail = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
      text: fromString(template),
    };
    await Email.newTransport(mailOptions);
  }

  async sendPasswordReset(): Promise<void> {
    const template = `
    <div style="font-family: 'Helvetica', 'Arial', sans-serif; background-color: #1a1a1a; color: #f0e6d2; padding: 30px; border: 2px solid #a8863f; border-radius: 10px;">
      <div style="text-align: center;">
        <img width="80" src="http://172.201.105.208/logo.png" alt="AzGate logo" />
        <h1 style="color: #ffd700;">¿Has perdido la clave de tu destino?</h1>
      </div>
  
      <p style="font-size: 16px; line-height: 1.5;">
        El equilibrio de Azeroth depende de ti. Usa este código para restablecer tu contraseña en el cliente AzGate:
      </p>
  
      <div style="background-color: #2d2d2d; padding: 10px; border-left: 4px solid #ffd700; margin: 20px 0;">
        <p style="font-size: 18px; color: #00bfff; word-break: break-all;"><strong>${this.url}</strong></p>
      </div>
  
      <p style="font-size: 16px;">
        ⚠️ Este sello de restauración es válido únicamente durante los próximos <strong>10 minutos</strong>.
      </p>
  
      <p style="font-style: italic; color: #ccc;">
        Si esta invocación no fue tuya, ignora este mensaje y sigue tu camino, héroe.
        <br>
        Cordiales saludos, el equipo de AzGate.
      </p>
    </div>
  `;  
    await this.send(template, 'AzGate Reset Password');
  }
}
