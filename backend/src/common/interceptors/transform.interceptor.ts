import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.sanitize(data)),
    );
  }

  private sanitize(data: any): any {
    if (Array.isArray(data)) {
      return data.map((v) => this.sanitize(v));
    }
    if (data !== null && typeof data === 'object') {
      const { password, resetToken, resetTokenExp, ...rest } = data;
      Object.keys(rest).forEach((key) => {
        rest[key] = this.sanitize(rest[key]);
      });
      return rest;
    }
    return data;
  }
}