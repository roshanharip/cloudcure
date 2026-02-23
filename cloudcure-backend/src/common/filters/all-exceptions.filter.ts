import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus: number =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const requestUrl = httpAdapter.getRequestUrl(ctx.getRequest()) as string;

    const responseBody = {
      success: false,
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
      data: null,
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: requestUrl,
    };

    // Filter harmless browser/devtools requests from logs
    const ignoredPaths = [
      '/favicon.ico',
      '/.well-known/appspecific/com.chrome.devtools.json',
    ];

    const shouldLog = !ignoredPaths.some((path) => requestUrl.includes(path));

    if (httpStatus === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(`Exception: ${JSON.stringify(exception)}`);
    } else if (shouldLog) {
      this.logger.warn(
        `Exception: ${httpStatus} - ${JSON.stringify(responseBody)}`,
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
