import nodemailer, { type SendMailOptions } from "nodemailer";
import { render, MagicLink } from "@justchat/email";
import { env } from "~/env.server";

export class EmailService {
  #transporter: nodemailer.Transporter;

  constructor() {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
      },
    });

    this.#transporter = transporter;
  }

  async send(options: SendMailOptions) {
    await this.#transporter.sendMail(options);
  }

  async sendMagicLink(email: string, link: string, expiryTime: string) {
    const options = {
      from: env.EMAIL_USER,
      to: email,
      subject: "Magic Link",
    };

    const html = await render(
      MagicLink({
        email,
        link,
        expiryTime,
      })
    );

    await this.send({
      ...options,
      html,
    });
  }
}

export const emailService = new EmailService();
