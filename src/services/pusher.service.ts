import { Injectable, Logger, Inject, Optional, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Locations } from "src/db/entities/Locations";
import { RfidGateway } from "../gateways/rfid.gateway";

const Pusher = require("pusher");

interface BatchedEvent {
  type: string;
  data: any;
  timestamp: number;
  rfid?: string;
}

@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name);
  pusher;
  private batchQueue: Map<string, Map<string, BatchedEvent>> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly BATCH_DELAY_MS = 10;
  constructor(
    private readonly config: ConfigService,
    @Optional() @Inject(forwardRef(() => RfidGateway)) private rfidGateway?: RfidGateway
  ) {
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
      useTLS: true,
      enabledTransports: ['ws', 'wss'],
      disableStats: true,
      activityTimeout: 60000,
      pongTimeout: 30000
    });

    this.logger.log(`Pusher initialized for cluster: ${cluster} (WebSocket optimized)`);
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
    const startTime = Date.now();
    const payload = {
      ...data,
      _pusherSentAt: startTime
    };

    this.pusher.trigger(channel, event, payload)
      .then(() => {
        const latency = Date.now() - startTime;
        this.logger.debug(`⚡ Pusher ${channel}/${event}: ${latency}ms`);
        
        if (latency > 500) {
          this.logger.warn(`⚠️ Slow Pusher: ${latency}ms for ${channel}/${event}`);
        }
      })
      .catch((error: any) => {
        const latency = Date.now() - startTime;
        this.logger.error(`Pusher async trigger failed: ${error.message} (${latency}ms)`, error.stack);
        this.logger.error(`Pusher error details - Channel: ${channel}, Event: ${event}, Data keys: ${Object.keys(data || {}).join(', ')}`);
        if (error.response) {
          this.logger.error(`Pusher API response: ${JSON.stringify(error.response)}`);
        }
      });
  }

  /**
   * ReSync event - non-blocking for better performance
   * RFID events routed through emergency channel, other events batched with 10ms delay
   * If same RFID is updated multiple times, only latest state is sent
   */
  reSync(type: string, data: any, urgent: boolean = false): void {
    try {
      // ⚡ RFID EVENTS: Route through emergency channel (no duplicates)
      if (urgent || data?.rfid || data?.action?.includes('RFID') || data?.action?.includes('REGISTER') || data?.action === 'RFID_DETECTED') {
        this.logger.debug(`⚡ Routing RFID event through emergency channel: ${data?.action || 'RFID event'}`);
        
        // ⚡ Route ALL RFID events through sendRegistrationUrgent (single channel)
        this.sendRegistrationUrgent({
          rfid: data.rfid,
          scannerCode: data.scannerCode,
          location: data.location?.name || data.location,
          locationId: data.location?.locationId || data.locationId,
          action: data.action || 'RFID_DETECTED',
          timestamp: data.timestamp || new Date(),
          ...data // Include any additional fields
        });
        
        return; // ⚡ EXIT IMMEDIATELY - don't enter batching logic at all
      }

      const batchKey = type;
      const rfid = data?.rfid || 'general';
      
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, new Map());
      }
      
      const queue = this.batchQueue.get(batchKey)!;
      queue.set(rfid, {
        type,
        data,
        timestamp: Date.now(),
        rfid
      });
      
      if (this.batchTimers.has(batchKey)) {
        clearTimeout(this.batchTimers.get(batchKey)!);
      }
      
      const timer = setTimeout(() => {
        this.flushBatch(batchKey);
      }, this.BATCH_DELAY_MS);
      
      this.batchTimers.set(batchKey, timer);
    } catch (ex) {
      this.logger.error(`reSync failed: ${ex.message}`, ex.stack);
    }
  }

  private flushBatch(batchKey: string): void {
    const queue = this.batchQueue.get(batchKey);
    if (!queue || queue.size === 0) {
      this.batchQueue.delete(batchKey);
      this.batchTimers.delete(batchKey);
      return;
    }

    const events = Array.from(queue.values());
    
    if (events.length === 1) {
      const event = events[0];
      this.triggerAsync("all", "reSync", { type: event.type, data: event.data });
    } else {
      const batchedData = {
        action: 'BATCH_UPDATE',
        updates: events.map(e => e.data),
        count: events.length,
        timestamp: new Date()
      };
      this.triggerAsync("all", "reSync", { type: events[0].type, data: batchedData });
      this.logger.debug(`Batched ${events.length} ${batchKey} events (${events.length} unique RFIDs) into single update`);
    }

    this.batchQueue.delete(batchKey);
    this.batchTimers.delete(batchKey);
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

  async sendRegistrationEventImmediate(data: {
    rfid: string;
    scannerCode: string;
    timestamp: Date | string;
    location?: Locations | { name: string; locationId: string };
    scannerType?: string;
    employeeUser?: EmployeeUsers;
  }): Promise<void> {
    try {
      const startTime = Date.now();
      this.logger.debug(`⚡ Sending IMMEDIATE registration event for RFID: ${data.rfid}`);
      
      const registrationPayload = {
        rfid: data.rfid,
        scannerCode: data.scannerCode,
        timestamp: data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp || Date.now()),
        location: data.location?.name || (data.location as any)?.name || 'Unknown',
        locationId: data.location?.locationId || (data.location as any)?.locationId,
        scannerType: data.scannerType || 'REGISTRATION',
        _pusherSentAt: startTime
      };

      const promises: Promise<any>[] = [
        this.pusher.trigger('registration-channel', 'new-registration', registrationPayload)
      ];

      if (data.employeeUser?.employeeUserCode) {
        const channel = `scanner-${data.employeeUser.employeeUserCode}`;
        this.logger.debug(`⚡ Sending to employee channel: ${channel}, RFID: ${data.rfid}`);
        promises.push(
          this.pusher.trigger(channel, "scanner", {
            data: {
              rfid: data.rfid,
              scannerCode: data.scannerCode,
              timestamp: data.timestamp,
              employeeUser: data.employeeUser,
              location: data.location,
              _pusherSentAt: startTime
            }
          })
        );
      }

      await Promise.all(promises);
      const latency = Date.now() - startTime;
      this.logger.debug(`⚡ Registration events sent in parallel: ${latency}ms for RFID: ${data.rfid}`);
      
      if (latency > 500) {
        this.logger.warn(`⚠️ Slow registration event: ${latency}ms`);
      }
    } catch (ex) {
      this.logger.error(`sendRegistrationEventImmediate failed: ${ex.message}`, ex.stack);
    }
  }

  sendRegistrationUrgent(data: any): Promise<number> {
    const startTime = Date.now();
    
    const locationName = data.location?.name || (typeof data.location === 'string' ? data.location : 'Unknown');
    const locationId = data.location?.locationId || data.locationId;
    
    const emergencyPayload = {
      rfid: data.rfid,
      scannerCode: data.scannerCode,
      location: locationName,
      locationId: locationId,
      _sentAt: startTime, 
      _instant: true,
      ...(data.action && { action: data.action }),
      ...(data.transactionId && { transactionId: data.transactionId }),
      ...(data.status && { status: data.status }),
      ...(data.statusId && { statusId: data.statusId }),
      ...(data.employeeUserCode && { employeeUserCode: data.employeeUserCode }),
      ...(data.scannerType && { scannerType: data.scannerType })
    };
    
    // ⚡ Try Socket.io first (ultra-fast, <10ms)
    if (this.rfidGateway) {
      try {
        this.rfidGateway.emitRfidEvent('rfid-urgent', emergencyPayload);
        const socketLatency = Date.now() - startTime;
        this.logger.debug(`⚡ Socket.io sent: ${socketLatency}ms for ${data.rfid}`);
        return Promise.resolve(socketLatency);
      } catch (err) {
        this.logger.warn(`Socket.io failed, falling back to Pusher: ${err.message}`);
        // Continue to Pusher fallback
      }
    } else {
      this.logger.debug(`⚠️ RfidGateway not available, using Pusher fallback for ${data.rfid}`);
    }
    
    // 🔄 Fallback to Pusher (if Socket.io fails or not available)
    return this.pusher.trigger('rfid-emergency-bypass', 'rfid-urgent', emergencyPayload)
      .then(() => {
        const latency = Date.now() - startTime;
        const environment = this.config.get<string>('NODE_ENV') || 'unknown';
        const cluster = this.config.get<string>('PUSHER_CLUSTER') || 'unknown';
        
        if (latency > 30) {
          this.logger.warn(`⚠️ Emergency RFID latency (Pusher): ${latency}ms for ${data.rfid} (env: ${environment}, cluster: ${cluster})`);
        } else {
          this.logger.debug(`⚡ Emergency RFID sent (Pusher): ${latency}ms`);
        }
        
        return latency;
      })
      .catch((err) => {
        const latency = Date.now() - startTime;
        const environment = this.config.get<string>('NODE_ENV') || 'unknown';
        this.logger.error(`Emergency channel failed: ${err.message} (${latency}ms, env: ${environment})`);
        return latency;
      });
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
