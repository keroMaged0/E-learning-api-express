import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { env } from '../config/env';
import { logger } from '../config/logger';

export interface IMail {
  to: string;
  subject: string;
  html: string;
}

class MailTransporter {
  transporter: Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    this.transporter = createTransport({
      service: env.mail.service,
      host: env.mail.host,
      port: env.mail.port!,
      auth: {
        user: env.mail.user,
        pass: env.mail.pass
      },
      secure: env.environment === 'production',
      // tls: {
      //   rejectUnauthorized: false,
      // },
    });
  }

  verifyTransporter() {
    this.transporter.verify(function (error, success) {
      if (error) {
        logger.error(error);
      } else {
        logger.info('email transporter verified', success);
      }
    });
  }

  async sendMail(options: IMail) {
    await this.transporter.sendMail({
      from: env.mail.user,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}

export const mailTransporter = new MailTransporter();
