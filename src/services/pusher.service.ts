/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const Pusher = require("pusher");

@Injectable()
export class PusherService {
  pusher;
  constructor(private readonly config: ConfigService) {
    this.pusher = new Pusher({
      appId: this.config.get<string>("PUSHER_APPID"),
      key: this.config.get<string>("PUSHER_KEY"),
      secret: this.config.get<string>("PUSHER_SECRET"),
      cluster: this.config.get<string>("PUSHER_CLUSTER"),
      useTLS: this.config
        .get<string>("PUSHER_USE_TLS")
        .toLowerCase()
        .includes("true"),
    });
  }
  trigger(channel, event, data: any) {
    this.pusher.trigger(channel, event, data);
  }

  async reSync(type: string, data: any) {
    try {
      this.pusher.trigger("all", "reSync", { type, data });
    } catch (ex) {
      throw ex;
    }
  }

  async sendTriggerRegister(userId: string, data) {
    try {
      this.pusher.trigger(userId, "register_request", {
        data,
      });
    } catch (ex) {
      throw ex;
    }
  }
}
