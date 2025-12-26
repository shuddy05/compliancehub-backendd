import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant ID from header, query param, or subdomain
    const tenantId =
      req.headers['x-tenant-id'] as string ||
      req.query.tenantId as string ||
      null;

    if (tenantId) {
      req['tenantId'] = tenantId;
    }

    next();
  }
}
