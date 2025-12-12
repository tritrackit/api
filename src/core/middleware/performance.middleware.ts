import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PerformanceMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Performance');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl } = req;
    
    // Track Pusher-related requests
    const isPusherRequest = originalUrl.includes('/units/') && 
      (method === 'POST' || method === 'PUT');
    
    if (isPusherRequest) {
      // Add performance header
      req.headers['x-request-start'] = start.toString();
      req.headers['x-transaction-id'] = `req_${start}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      
      if (isPusherRequest && duration > 100) {
        this.logger.warn(`🚨 SLOW ${method} ${originalUrl}: ${duration}ms (${statusCode})`);
      } else if (isPusherRequest) {
        this.logger.debug(`⚡ ${method} ${originalUrl}: ${duration}ms (${statusCode})`);
      }
    });
    
    next();
  }
}

