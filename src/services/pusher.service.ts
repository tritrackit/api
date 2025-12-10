import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Locations } from "src/db/entities/Locations";

const Pusher = require("pusher");

@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name);
  pusher;
  
  constructor(private readonly config: ConfigService) {
    const appId = this.config.get<string>("PUSHER_APPID");
    const key = this.config.get<string>("PUSHER_KEY");
    const secret = this.config.get<string>("PUSHER_SECRET");
    const cluster = this.config.get<string>("PUSHER_CLUSTER");
    const useTLS = this.config
      .get<string>("PUSHER_USE_TLS")
      ?.toLowerCase()
      .includes("true") ?? true;

    if (!appId || !key || !secret || !cluster) {
      this.logger.warn(
        "Pusher configuration is incomplete. Real-time updates may not work. " +
        "Please set PUSHER_APPID, PUSHER_KEY, PUSHER_SECRET, and PUSHER_CLUSTER environment variables."
      );
    }

    this.pusher = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS,
    });

    this.logger.log(`Pusher initialized for cluster: ${cluster}`);
  }

  async trigger(channel: string, event: string, data: any): Promise<void> {
    try {
    await this.pusher.trigger(channel, event, data);
    } catch (error) {
      this.logger.error(`Pusher trigger failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  triggerAsync(channel: string, event: string, data: any): void {
    this.pusher.trigger(channel, event, data)
      .then(() => {
        this.logger.debug(`Pusher event triggered: ${channel}/${event}`);
      })
      .catch((error: any) => {
        this.logger.error(`Pusher async trigger failed: ${error.message}`, error.stack);
        this.logger.error(`Pusher error details - Channel: ${channel}, Event: ${event}, Data keys: ${Object.keys(data || {}).join(', ')}`);
        if (error.response) {
          this.logger.error(`Pusher API response: ${JSON.stringify(error.response)}`);
        }
      });
  }

  /**
   * ReSync event - non-blocking for better performance
   */
  reSync(type: string, data: any): void {
    try {
      this.triggerAsync("all", "reSync", { type, data });
    } catch (ex) {
      this.logger.error(`reSync failed: ${ex.message}`, ex.stack);
    }
  }

  async reSyncAwait(type: string, data: any): Promise<void> {
    try {
      await this.trigger("all", "reSync", { type, data });
    } catch (ex) {
      this.logger.error(`reSyncAwait failed: ${ex.message}`, ex.stack);
      throw ex;
    }
  }

  sendTriggerRegister(
    employeeUserCode: string,
    data: {
      rfid: string;
      scannerCode: string;
      employeeUser: EmployeeUsers;
      location: Locations;
      timestamp: Date;
    }
  ): void {
    try {
      if (!employeeUserCode) {
        this.logger.warn(`sendTriggerRegister: employeeUserCode is missing, cannot send event for RFID: ${data.rfid}`);
        return;
      }
      const channel = `scanner-${employeeUserCode}`;
      this.logger.debug(`Sending registration event to channel: ${channel}, RFID: ${data.rfid}`);
      this.triggerAsync(channel, "scanner", { data });
    } catch (ex) {
      this.logger.error(`sendTriggerRegister failed: ${ex.message}`, ex.stack);
    }
  }

  async sendTriggerRegisterAwait(
    employeeUserCode: string,
    data: {
      rfid: string;
      scannerCode: string;
      employeeUser: EmployeeUsers;
      location: Locations;
      timestamp: Date;
    }
  ): Promise<void> {
    try {
      await this.trigger(`scanner-${employeeUserCode}`, "scanner", { data });
    } catch (ex) {
      this.logger.error(`sendTriggerRegisterAwait failed: ${ex.message}`, ex.stack);
      throw ex;
    }
  }
}
