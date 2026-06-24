import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import type { ApiResponse } from '@milli/shared-types'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const reply = ctx.getResponse<FastifyReply>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error'

    const body: ApiResponse = {
      success: false,
      error: { code: String(status), message },
    }

    reply.status(status).send(body)
  }
}
