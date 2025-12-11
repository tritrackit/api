"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = __importDefault(require("nodemailer"));
const promises_1 = require("fs/promises");
const config_1 = require("@nestjs/config");
const path_1 = __importDefault(require("path"));
const utils_1 = require("../common/utils/utils");
let EmailService = EmailService_1 = class EmailService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(EmailService_1.name);
    }
    async sendEmailVerification(recipient, otp) {
        try {
            const evEmail = this.config.get("EV_EMAIL");
            const evPass = this.config.get("EV_PASS");
            const evAddress = this.config.get("EV_ADDRESS");
            const evSubject = this.config.get("EV_SUBJECT");
            const evTempPath = this.config.get("EV_TEMPLATE_PATH");
            const evCompany = this.config.get("EV_COMPANY");
            const evVerifyURL = this.config.get("EV_URL");
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: evEmail,
                    pass: evPass.toString().trim(),
                },
            });
            let emailTemplate = await (0, promises_1.readFile)(path_1.default.join(__dirname, evTempPath), "utf-8");
            emailTemplate = emailTemplate.replace("{{_OTP_}}", otp);
            emailTemplate = emailTemplate.replace("{{_URL_}}", `${evVerifyURL}?email=${recipient}&code=${otp}`);
            emailTemplate = emailTemplate.replace("{{_YEAR_}}", new Date().getFullYear().toString());
            const replacements = {
                "{{_COMPANY_}}": evCompany,
            };
            emailTemplate = Object.entries(replacements).reduce((tpl, [key, value]) => tpl.split(key).join(value), emailTemplate);
            const info = await transporter.sendMail({
                from: evAddress,
                to: recipient,
                subject: evSubject,
                html: emailTemplate,
            });
            this.logger.log(`Message sent: ${info.messageId}`);
            const previewUrl = nodemailer_1.default.getTestMessageUrl(info);
            if (previewUrl) {
                this.logger.debug(`Preview URL: ${previewUrl}`);
            }
            return true;
        }
        catch (ex) {
            throw ex;
        }
    }
    async sendResetPasswordOtp(recipient, userCode, otp) {
        try {
            const evEmail = this.config.get("EV_EMAIL");
            const evPass = this.config.get("EV_PASS");
            const evAddress = this.config.get("EV_ADDRESS");
            const evSubject = this.config.get("EV_RESET_SUBJECT");
            const evTempPath = this.config.get("EV_RESET_TEMPLATE_PATH");
            const evCompany = this.config.get("EV_COMPANY");
            const evVerifyURL = this.config.get("EV_URL");
            const transporter = nodemailer_1.default.createTransport({
                service: "gmail",
                auth: {
                    user: evEmail,
                    pass: evPass.toString().trim(),
                },
            });
            let emailTemplate = await (0, promises_1.readFile)(path_1.default.join(__dirname, evTempPath), "utf-8");
            emailTemplate = emailTemplate.replace("{{_OTP_}}", otp);
            const hastOTP = await (0, utils_1.hash)(otp);
            emailTemplate = emailTemplate.replace("{{_URL_}}", `${evVerifyURL}?user=${userCode}&code=${hastOTP}`);
            emailTemplate = emailTemplate.replace("{{_YEAR_}}", new Date().getFullYear().toString());
            emailTemplate = emailTemplate.replace("{{_COMPANY_}}", evCompany);
            const info = await transporter.sendMail({
                from: evAddress,
                to: recipient,
                subject: evSubject,
                html: emailTemplate,
            });
            this.logger.log(`Message sent: ${info.messageId}`);
            const previewUrl = nodemailer_1.default.getTestMessageUrl(info);
            if (previewUrl) {
                this.logger.debug(`Preview URL: ${previewUrl}`);
            }
            return true;
        }
        catch (ex) {
            throw ex;
        }
    }
};
EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map