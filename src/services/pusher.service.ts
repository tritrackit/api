/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Locations } from "src/db/entities/Locations";

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
      useTLS: (this.config.get<string>("PUSHER_USE_TLS") || "true")
      .toLowerCase()
      .includes("true"),
  });
  }
  async trigger(channel, event, data: any) {
    await this.pusher.trigger(channel, event, data);
  }

  async reSync(type: string, data: any) {
    try {
      await this.pusher.trigger("all", "reSync", { type, data });
    } catch (ex) {
      throw ex;
    }
  }

  async sendTriggerRegister(
    employeeUserCode: string,
    data: {
      rfid: string;
      scannerCode: string;
      employeeUser: EmployeeUsers;
      location: Locations;
      timestamp: Date;
    }
  ) {
    try {
      await this.pusher.trigger(`scanner-${employeeUserCode}`, "scanner", {
        data,
      });
    } catch (ex) {
      throw ex;
    }
  }
}
