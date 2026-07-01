import { Controller, Post, Query, UseGuards, Req, BadRequestException } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { IncomingMessage } from 'http'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { UploadService, UploadedFile } from './upload.service'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const Busboy = require('busboy') as (opts: any) => any

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  async uploadImage(
    @Req() req: FastifyRequest,
    @Query('folder') folder = 'misc',
  ): Promise<{ url: string }> {
    const file = await parseMultipartFile(req.raw as IncomingMessage, req.headers as Record<string, string>)
    const url = await this.uploadService.uploadFile(file, folder)
    return { url }
  }
}

function parseMultipartFile(raw: IncomingMessage, headers: Record<string, string>): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers })
    let resolved = false

    bb.on('file', (_field: string, stream: NodeJS.ReadableStream & { on: Function }, info: { filename: string; mimeType: string }) => {
      const chunks: Buffer[] = []
      stream.on('data', (chunk: Buffer) => chunks.push(chunk))
      stream.on('close', () => {
        if (resolved) return
        resolved = true
        const buffer = Buffer.concat(chunks)
        resolve({ buffer, mimetype: info.mimeType, originalname: info.filename ?? 'upload', size: buffer.length })
      })
      stream.on('error', reject)
    })

    bb.on('finish', () => {
      if (!resolved) reject(new BadRequestException('Nenhum arquivo enviado'))
    })

    bb.on('error', reject)
    raw.pipe(bb)
  })
}
