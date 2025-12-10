import { Injectable, Logger } from "@nestjs/common";
import nodemailer from "nodemailer";
import { readFile } from "fs/promises"; // ES6 import for file system access
import { ConfigService } from "@nestjs/config";
import path from "path";
import { hash } from "src/common/utils/utils";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendEmailVerification(recipient, otp) {
    try {
      const evEmail = this.config.get<string>("EV_EMAIL");
      const evPass = this.config.get<string>("EV_PASS");
      const evAddress = this.config.get<string>("EV_ADDRESS");
      const evSubject = this.config.get<string>("EV_SUBJECT");
      const evTempPath = this.config.get<string>("EV_TEMPLATE_PATH");
      const evCompany = this.config.get<string>("EV_COMPANY");
      const evVerifyURL = this.config.get<string>("EV_URL");
      const transporter = nodemailer.createTransport({
        service: "gmail", // Use 'gmail' for Google's SMTP
        auth: {
          user: evEmail, // Replace with your Gmail address
          pass: evPass.toString().trim(), // Replace with your Gmail App Password
        },
      });
      let emailTemplate = await readFile(
        path.join(__dirname, evTempPath),
        "utf-8"
      );
      emailTemplate = emailTemplate.replace("{{_OTP_}}", otp);
      const hastOTP = await hash(otp);
      emailTemplate = emailTemplate.replace(
        "{{_URL_}}",
        `${evVerifyURL}?email=${recipient}&code=${hastOTP}`
      );
      emailTemplate = emailTemplate.replace(
        "{{_YEAR_}}",
        new Date().getFullYear().toString()
      );
      // Replace multiple placeholders using join and reduce
      const replacements = {
        "{{_COMPANY_}}": evCompany,
      };
      emailTemplate = Object.entries(replacements).reduce(
        (tpl, [key, value]) => tpl.split(key).join(value),
        emailTemplate
      );
      const info = await transporter.sendMail({
        from: evAddress, // Sender address
        to: recipient, // List of recipients
        subject: evSubject, // Subject line
        html: emailTemplate, // HTML body
      });

      this.logger.log(`Message sent: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.debug(`Preview URL: ${previewUrl}`);
      }
      return true;
    } catch (ex) {
      throw ex;
    }
  }

  async sendResetPasswordOtp(recipient, userCode, otp) {
    try {
      const evEmail = this.config.get<string>("EV_EMAIL");
      const evPass = this.config.get<string>("EV_PASS");
      const evAddress = this.config.get<string>("EV_ADDRESS");
      const evSubject = this.config.get<string>("EV_RESET_SUBJECT");
      const evTempPath = this.config.get<string>("EV_RESET_TEMPLATE_PATH");
      const evCompany = this.config.get<string>("EV_COMPANY");
      const evVerifyURL = this.config.get<string>("EV_URL");
      const transporter = nodemailer.createTransport({
        service: "gmail", // Use 'gmail' for Google's SMTP
        auth: {
          user: evEmail, // Replace with your Gmail address
          pass: evPass.toString().trim(), // Replace with your Gmail App Password
        },
      });
      let emailTemplate = await readFile(
        path.join(__dirname, evTempPath),
        "utf-8"
      );
      emailTemplate = emailTemplate.replace("{{_OTP_}}", otp);
      const hastOTP = await hash(otp);
      emailTemplate = emailTemplate.replace(
        "{{_URL_}}",
        `${evVerifyURL}?user=${userCode}&code=${hastOTP}`
      );
      emailTemplate = emailTemplate.replace(
        "{{_YEAR_}}",
        new Date().getFullYear().toString()
      );
      emailTemplate = emailTemplate.replace("{{_COMPANY_}}", evCompany);
      const info = await transporter.sendMail({
        from: evAddress, // Sender address
        to: recipient, // List of recipients
        subject: evSubject, // Subject line
        html: emailTemplate, // HTML body
      });

      this.logger.log(`Message sent: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.debug(`Preview URL: ${previewUrl}`);
      }
      return true;
    } catch (ex) {
      throw ex;
    }
  }
}
